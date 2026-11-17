const fallback = [];
let articles = [...fallback];
const grid = document.getElementById("articleGrid");
let activeFilter = "all";
let query = "";
const formatDate = value => {const d=new Date(value+"T00:00:00");return Number.isNaN(d.getTime())?value:new Intl.DateTimeFormat("hi-IN",{day:"numeric",month:"short",year:"numeric"}).format(d)};
function render(){
 const filtered=articles.filter(a=>(activeFilter==="all"||a.category===activeFilter)&&[a.title,a.excerpt,a.label].join(" ").toLowerCase().includes(query.toLowerCase()));
 if(!filtered.length){grid.innerHTML='<div class="empty">कोई अपडेट नहीं मिला। दूसरा शब्द खोजें।</div>';return}
 grid.innerHTML=filtered.map(a=>'<article class="article-card"><div class="article-meta"><span class="tag">'+escapeHtml(a.label||"Latest Update")+'</span><time>'+formatDate(a.date||"")+'</time></div><h3>'+escapeHtml(a.title)+'</h3><p>'+escapeHtml(a.excerpt||"पूरी जानकारी पढ़ने के लिए लेख खोलें।")+'</p><div class="article-bottom"><span>स्रोत: '+escapeHtml(a.sourceTitle||"Official source")+'</span><span><a class="read-link" href="/news/'+encodeURIComponent(a.id)+'.html">पूरा लेख पढ़ें →</a></span></div></article>').join("");
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
document.querySelectorAll(".filter").forEach(b=>b.addEventListener("click",()=>{document.querySelector(".filter.active")?.classList.remove("active");b.classList.add("active");activeFilter=b.dataset.filter;render()}));
document.getElementById("searchForm").addEventListener("submit",e=>{e.preventDefault();query=document.getElementById("searchInput").value.trim();document.getElementById("latest").scrollIntoView({behavior:"smooth"});render()});
document.getElementById("menuBtn").addEventListener("click",()=>document.getElementById("mainNav").classList.toggle("open"));
document.querySelectorAll("#mainNav a").forEach(a=>a.addEventListener("click",()=>document.getElementById("mainNav").classList.remove("open")));
document.getElementById("today").textContent=new Intl.DateTimeFormat("hi-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(new Date());
document.getElementById("year").textContent=new Date().getFullYear();
render();
fetch("/data/latest.json",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(data=>{if(Array.isArray(data)){articles=data;render()}}).catch(()=>{});
