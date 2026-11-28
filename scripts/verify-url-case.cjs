const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const assert = require('node:assert/strict');
const ts = require('typescript');
globalThis.AsyncLocalStorage ??= require('node:async_hooks').AsyncLocalStorage;
const { NextRequest } = require('next/server');
const { unstable_doesMiddlewareMatch } = require('next/experimental/testing/server');

// Exercise the actual TypeScript modules without starting a Next.js server.
function loadTypeScript(filename) {
  const absolute = path.resolve(filename);
  const localRequire = createRequire(absolute);
  const mod = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(absolute, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  function resolve(name) {
    if (name.startsWith('@/')) {
      const target = path.resolve('src', name.slice(2));
      return name.endsWith('.json') || name.endsWith('.mjs') ? localRequire(target) : loadTypeScript(target + '.ts');
    }
    return localRequire(name);
  }
  vm.runInNewContext('(function(require,module,exports){' + code + '\n})', { URL })(resolve, mod, mod.exports);
  return mod.exports;
}
const { proxy, config } = loadTypeScript('src/proxy.ts');
const content = loadTypeScript('src/lib/content.ts');
const origin = 'https://exelciusautomation.vercel.app';
const matched = url => unstable_doesMiddlewareMatch({ config, nextConfig: {}, url });
function redirect(from, to) {
  assert.ok(matched(from), 'Proxy matcher must cover ' + from);
  const response = proxy(new NextRequest(origin + from));
  assert.equal(response.status, 308, from);
  assert.equal(response.headers.get('location'), origin + to, from);
  const next = proxy(new NextRequest(origin + to));
  assert.equal(next.headers.get('location'), null, 'No redirect loop: ' + to);
}
redirect('/Industrial-Automation-Service-Providers', '/industrial-automation-service-providers');
redirect('/ABOUT-US?utm_source=Google', '/about-us?utm_source=Google');
redirect('/BLOG.PHP?slug=WHO-ARE-THE-BEST-INDUSTRIAL-AUTOMATION-SERVICE-PROVIDERS&ref=Email', '/blog.php?slug=who-are-the-best-industrial-automation-service-providers&ref=Email');
redirect('/PAGE.PHP?slug=SCADA', '/page.php?slug=scada');
redirect('/%49ndustrial-Automation-Service-Providers', '/industrial-automation-service-providers');
redirect('/SITEMAP.HTML', '/sitemap.html');
let checked = 0;
for (const page of content.pages.filter(page => page.slug)) {
  const lower = '/' + page.slug.toLowerCase();
  const upper = '/' + page.slug.toUpperCase();
  redirect(upper, lower);
  redirect(upper + '.PHP', lower + '.php');
  assert.equal(content.findPage(page.slug.toLowerCase()).slug, page.slug);
  assert.equal(content.findPage(page.slug.toUpperCase() + '.PHP').slug, page.slug);
  const canonical = new URL(content.getCanonical(page.slug));
  assert.equal(canonical.pathname, canonical.pathname.toLowerCase());
  checked++;
}
for (const blog of content.blogs) {
  redirect('/' + blog.slug.toUpperCase(), '/' + blog.slug.toLowerCase());
  assert.equal(content.findBlog(blog.slug.toUpperCase()).slug, blog.slug);
  checked++;
}
for (const asset of ['/images/new_banners/hero%20section%20-2.png.webp', '/images/certificate/1.PDF', '/profile/image26.png', '/_next/static/Test.js', '/api/Test', '/Logo.PNG', '/IMAGES/MyPhoto.webp']) {
  assert.equal(proxy(new NextRequest(origin + asset)).headers.get('location'), null, 'Preserve asset/API path: ' + asset);
}
for (const asset of ['/images/banner/test.webp', '/_next/static/Test.js', '/api/Test']) assert.equal(matched(asset), false);
console.log(`Case-insensitive routing checks passed for ${checked} pages/blogs, PHP aliases, query strings, encoded paths, canonical URLs, asset exclusions and redirect-loop prevention.`);
