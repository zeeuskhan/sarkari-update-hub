const restUrl = "https://www.apprenticeshipinternship.in/wp-json/wp/v2/posts?per_page=15&orderby=date&order=desc&_fields=date,link,slug,title,excerpt";
const feedUrl = "https://www.apprenticeshipinternship.in/feed/";
const clean = (html = "") => html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&#8217;/g, "’").replace(/&#8211;/g, "–").replace(/&#038;|&amp;/g, "&").replace(/&#8220;/g, "“").replace(/&#8221;/g, "”").replace(/&#8212;/g, "—").replace(/&#039;|&#8216;|&#8217;/g, "’").replace(/\s+/g, " ").trim();
const decode = s => clean(s).replace(/&quot;/g,'"').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n)));
const classify = (title, excerpt) => {
 const s = (title + " " + excerpt).toLowerCase();
 if (/internship|intern|apprentice|प्रशिक्षु|इंटर्न/.test(s)) return ["internship","Internship"];
 if (/scholarship|छात्रवृत्ति|स्कॉलरशिप/.test(s)) return ["education","Scholarship"];
 if (/yojana|scheme|pension|योजना|पेंशन|subsidy|अनुदान|आवास/.test(s)) return ["scheme","सरकारी योजना"];
 if (/aadhaar|e-kyc|ekyc|आधार|सत्यापन/.test(s)) return ["education","e-KYC & Updates"];
 if (/job|bharti|recruitment|vacancy|भर्ती|नौकरी/.test(s)) return ["jobs","सरकारी नौकरी"];
 return ["education","Education & Updates"];
};
let result = [];
try {
 const response = await fetch(restUrl);
 if (!response.ok) throw new Error("REST feed unavailable");
 const posts = await response.json();
 result = posts.map(post => {
  const title = clean(post.title?.rendered || "");
  const excerpt = clean(post.excerpt?.rendered || "");
  const [category,label] = classify(title,excerpt);
  return {id:post.slug,title,category,label,date:(post.date||"").slice(0,10),excerpt:excerpt.slice(0,420),sourceUrl:post.link,sourceTitle:"Apprent Inter Portal"};
 }).filter(p=>p.title&&p.sourceUrl);
} catch (error) {
 const response = await fetch(feedUrl);
 if (!response.ok) throw new Error("Could not read source WordPress REST API or RSS feed");
 const xml = await response.text();
 const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0,15);
 result = items.map(([,item]) => {
  const tag = name => item.match(new RegExp("<"+name+"[^>]*>([\\s\\S]*?)<\/"+name+">","i"))?.[1] || "";
  const title = decode(tag("title"));
  const excerpt = decode(tag("description")).slice(0,420);
  const sourceUrl = tag("link").trim();
  const rawDate = tag("pubDate");
  const [category,label] = classify(title,excerpt);
  return {id:tag("guid").trim().split("/").filter(Boolean).pop()||sourceUrl.split("/").filter(Boolean).pop(),title,category,label,date:Number.isNaN(Date.parse(rawDate))?new Date().toISOString().slice(0,10):new Date(rawDate).toISOString().slice(0,10),excerpt,sourceUrl,sourceTitle:"Apprent Inter Portal"};
 }).filter(p=>p.title&&p.sourceUrl);
}
if (!result.length) throw new Error("Source feed returned no usable article summaries");
await import("node:fs/promises").then(fs=>fs.writeFile("public/data/latest.json",JSON.stringify(result,null,2)+"\n"));
console.log("Updated "+result.length+" attributed source summaries.");
