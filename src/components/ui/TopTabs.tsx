"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { BookOpen, Film, Gift, Heart, Sparkles, ChevronUp, GripHorizontal, Play, Plus } from "lucide-react";
import { getCreations, toggleHeart, type CreationItem } from "@/lib/creation-store";

const TYPE_CONFIG: Record<string, { label: string; gradient: string; accentColor: string; icon: React.ElementType }> = {
  shortbook: { label: "숏북", gradient: "from-emerald-400 via-teal-500 t-cyan-600", accentColor: "text-emerald-500", icon: BookOpen },
  shortmovie: { label: "숏뮤비", gradient: "from-violet-500 via-purple-500 to-indigo-600", accentColor: "text-violet-500", icon: Film },
  goods: { label: "굿즈", gradient: "from-orange-400 via-rose-400 to-pink-500", accentColor: "text-orange-500", icon: Gift },
};

export default function TopTabs() {
  const { bookId } = useParams();
  const router = useRouter();
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [creations, setCreations] = useState<CreationItem[]>([]);
  const [galleryHeight, setGalleryHeight] = useState(280);
  useEffect(() => { setGalleryOpen(false); setCreations(getCreations(bookId as string)); }, [bookId]);
  const refreshCreations = () => setCreations(getCreations(bookId as string));
  const handleHeart = (id: string) => { toggleHeart(id); refreshCreations(); };

  const handleCreate = (type: "shortbook" | "shortmovie" | "goods") => {
    router.push(`/creation/${type}?bookId=${bookId}`);
  };

  return (
    <div className="bg-white dark:bg-mono-900 border-b border-mono-200 dark:border-mono-800 flex flex-col flex-shrink-0">
      <button onClick={() => setGalleryOpen(!galleryOpen)} className="flex items-center justify-between px-4 py-2.5 w-full hover:bg-gray-50 dark:hover:bg-mono-800 transition-colors">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-primary-500" strokeWidth={1.5} />
          <span className="text-sm font-semibold text-gray-800 dark:text-mono-200">창작 갤러리</span>
          {creations.length > 0 && <span className="text-[10px] font-semibold bg-primary-500 text-white px-1.5 py-0.5 rounded-full">{creations.length}</span>}
        </div>
        <ChevronUp className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${galleryOpen ? "" : "rotate-180"}`} strokeWidth={1.5} />
      </button>
      {galleryOpen && (
        <div className="flex justify-center py-1 cursor-ns-resize hover:bg-mono-50 select-none"
          onMouseDown={(e) => { e.preventDefault(); const sY=e.clientY,sH=galleryHeight; const oM=(ev: MouseEvent)=>setGalleryHeight(Math.min(560,Math.max(140,sH+ev.clientY-sY))); const oU=()=>{window.removeEventListener("mousemove",oM);window.removeEventListener("mouseup",oU);}; window.addEventListener("mousemove",oM);window.addEventListener("mouseup",oU); }}>
          <GripHorizontal className="w-4 h-4 text-mono-300" strokeWidth={1.5} />
        </div>
      )}
      <div className={`overflow-hidden transition-all duration-300 ${galleryOpen ? "" : "max-h-0"}`} style={galleryOpen ? { maxHeight: galleryHeight } : undefined}>
        <div className="flex flex-wrap gap-2 justify-start px-4 py-2.5 border-b border-mono-100 dark:border-mono-800">
          {(["shortbook","shortmovie","goods"] as const).map((type) => {
            const cfg=TYPE_CONFIG[type]; const Icon=cfg.icon;
            return (<button key={type} onClick={()=>handleCreate(type)} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-mono-200 text-mono-700 hover:bg-mono-50 hover:border-mono-300 dark:bg-[#1e2a1e] dark:border-[#2a3a2a] dark:text-[#c8d5c8] dark:hover:bg-[#2a332a] transition-colors shadow-sm"><Icon className={`w-3.5 h-3.5 ${cfg.accentColor}`} strokeWidth={1.5} />{cfg.label}만들기</button>);
          })}
        </div>
        <div className="overflow-y-auto custom-scrollbar p-3" style={{ maxHeight: "calc(100% - 56px)" }}>
          {creations.length === 0 ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-mono-50 rounded-2xl flex items-center justify-center mx-auto mb-3"><Sparkles className="w-7 h-7 text-mono-300" strokeWidth={1.5} /></div>
              <p className="text-mono-700 font-semibold text-sm">첫 창작물을 만들어보세요!</p>
              <p className="text-xs text-mono-400 mt-1 leading-relaxed">AI로 숏북, 뮤비, 굿즈를 만들 수 있어요 ✨</p>
              <button onClick={()=>handleCreate("shortbook")} className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-primary-500 text-white hover:bg-primary-600 transition-colors"><Plus className="w-3.5 h-3.5" strokeWidth={2} />지금 만들기</button>
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-2">{creations.map((item)=>{const cfg=TYPE_CONFIG[item.type];const Icon=cfg.icon;return <CreationCard key={item.id} item={item} cfg={cfg} Icon={Icon} onHeart={()=>handleHeart(item.id)} />;})}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function CreationCard({item,cfg,Icon,onHeart}:{item:CreationItem;cfg:{label:string;gradient:string;accentColor:string;icon:React.ElementType};Icon:React.ElementType;onHeart:()=>void}) {
  return (
    <div className="group cursor-pointer rounded-xl overflow-hidden border border-mono-100 hover:border-mono-200 hover:shadow-lg transition-all duration-200">
      <div className="aspect-[3/4] relative overflow-hidden bg-mono-100">
        {item.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${cfg.gradient} flex flex-col items-end justify-end p-2`}>
            <div className="absolute inset-0 opacity-20"><div className="absolute top-1 left-1 w-8 h-8 rounded-full bg-white/30" /><div className="absolute bottom-3 right-1 w-5 h-5 rounded-full bg-white/20" /><div className="absolute top-4 right-2 w-3 h-3 rounded-full bg-white/25" /></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"><div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center"><Icon className="w-5 h-5 text-white" strokeWidth={1.5} /></div></div>
            <p className="relative text-[9px] text-white/90 font-semibold text-right line-clamp-2 leading-tight z-10">{item.title}</p>
          </div>
        )}
        <span className="absolute top-1.5 left-1.5 text-[8px] font-bold bg-black/50 text-white px-1.5 py-0.5 rounded-full backdrop-blur-sm">{cfg.label}</span>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center"><div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md"><Play className="w-3.5 h-3.5 text-mono-800 ml-0.5" strokeWidth={2} /></div></div>
        <button onClick={(e)=>{e.stopPropagation();onHeart();}} className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 bg-black/40 backdrop-blur-sm rounded-full px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><Heart className={`w-2.5 h-2.5 ${item.hearted?"fill-red-400 text-red-400":"text-white"}`} /><span className="text-[8px] text-white font-medium">{item.hearts}</span></button>
      </div>
    </div>
  );
}
