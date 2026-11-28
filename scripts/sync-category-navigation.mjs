import fs from 'node:fs';
import assert from 'node:assert/strict';
const pages = JSON.parse(fs.readFileSync('src/data/legacy.json'));
const records = JSON.parse(fs.readFileSync('audit/published-source-records.json')).pages;
const header = fs.readFileSync('../Previous/frame/header.php', 'utf8');
const helper = fs.readFileSync('../Previous/frame/page_helper.php', 'utf8');
const definitions = [
  ['industrial-automation', 'Industrial Automation', 'industrial-automation-service-providers'],
  ['infrastructure-solutions', 'Infrastructure Solutions', 'MS-Poles'],
  ['electrical-solutions', 'Electrical Solutions', 'ups'],
  ['lfp-batteries', 'LFP Batteries', 'LFP-Battery-25.6V-310Ah'],
  ['highway-solutions', 'Highway Solutions', 'highway-electrical-automation-service-providers'],
  ['solar-solutions', 'Solar Solutions', 'solar-solution-providers'],
  ['field-instruments', 'Field Instruments', 'field-instruments'],
];
const defaults = (source, id) => {
  const block = source.match(new RegExp("'" + id + "' => \\[([\\s\\S]*?)\\n\\s*\\],"))?.[1] || '';
  return [...block.matchAll(/\['slug'\s*=>\s*'([^']+)',\s*'page_name'\s*=>\s*'([^']+)'\]/g)].map(m => ({ slug: m[1], label: m[2].replace(/\s+/g, ' ') }));
};
const sorted = group => records.filter(p => p.page_group === group && p.status === 'published').sort((a,b) => (Number(a.nav_order) || 9999) - (Number(b.nav_order) || 9999) || Number(a.id) - Number(b.id));
const categories = definitions.map(([id,title,slug]) => {
  const db = sorted(id);
  const visible = db.filter(p => p.show_in_nav === '1').map(p => ({ slug: p.slug, label: p.page_name }));
  const items = visible.length ? visible : defaults(header, id);
  const sidebarItems = defaults(helper, id);
  for (const p of db) if (!sidebarItems.some(item => item.slug.toLowerCase() === p.slug.toLowerCase())) sidebarItems.push({ slug: p.slug, label: p.page_name });
  return { id, title, href: '/' + slug, items, sidebarItems };
});
const pageGroups = {};
for (const page of pages) {
  const php = fs.readFileSync('../Previous/' + page.file, 'utf8');
  const group = php.match(/renderCategorySidebar\(\s*'([^']+)'/)?.[1] || page.group;
  if (categories.some(c => c.id === group)) pageGroups[page.slug] = group;
}
for (const category of categories) for (const item of [...category.items,...category.sidebarItems]) assert.ok(pages.some(p => p.slug === item.slug), 'Missing route: ' + item.slug);
fs.writeFileSync('src/data/category-navigation.json', JSON.stringify({ categories, pageGroups }, null, 2) + '\n');
console.log('Restored ' + categories.length + ' categories, ' + categories.reduce((n,c)=>n+c.items.length,0) + ' dropdown links, and sidebar mappings for ' + Object.keys(pageGroups).length + ' pages.');
