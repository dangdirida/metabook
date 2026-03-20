"use client";
import { useState, useEffect, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import { X, BookOpen, Film, Gift, Heart, Sparkles, ChevronRight, ChevronUp, RefreshCw, Bookmark, Smile, Image as ImageIcon, GripHorizontal, Play, Plus } from "lucide-react";
import { getCreations, toggleHeart, type CreationItem } from "@/lib/creation-store";

const TYPE_CONFIG: Record<string, { label: string; gradient: string; accentColor: string; icon: React.ElementType }> = {
  shortbook: { label: "숏북", gradient: "from-emerald-400 via-teal-500 t-cyan-600", accentColor: "text-emerald-500", icon: BookOpen },
  shortmovie: { label: "숏뮤비", gradient: "from-violet-500 via-purple-500 to-indigo-600", accentColor: "text-violet-500", icon: Film },
  goods: { label: "굿즈", gradient: "from-orange-400 via-rose-400 to-pink-500", accentColor: "text-orange-500", icon: Gift },
};
type ModalType = "shortbook" | "shortmovie" | "goods" | null;

export default function TopTabs() {
  const { bookId } = useParams();
  const router = useRouter();
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [creations, setCreations] = useState<CreationItem[]>([]);
  const [galleryHeight, setGalleryHeight] = useState(280);
  useEffect(() => { setGalleryOpen(false); setCreations(getCreations(bookId as string)); }, [bookId]);
  const refreshCreations = () => setCreations(getCreations(bookId as string));
  const handleHeart = (id: string) => { toggleHeart(id); refreshCreations(); };
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
            return (<button key={type} onClick={()=>setOpenModal(type)} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-mono-200 text-mono-700 hover:bg-mono-50 hover:border-mono-300 dark:bg-[#1e2a1e] dark:border-[#2a3a2a] dark:text-[#c8d5c8] dark:hover:bg-[#2a332a] transition-colors shadow-sm"><Icon className={`w-3.5 h-3.5 ${cfg.accentColor}`} strokeWidth={1.5} />{cfg.label}만들기</button>);
          })}
        </div>
        <div className="overflow-y-auto custom-scrollbar p-3" style={{ maxHeight: "calc(100% - 56px)" }}>
          {creations.length === 0 ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-mono-50 rounded-2xl flex items-center justify-center mx-auto mb-3"><Sparkles className="w-7 h-7 text-mono-300" strokeWidth={1.5} /></div>
              <p className="text-mono-700 font-semibold text-sm">첫 창작물을 만들어보세요!</p>
              <p className="text-xs text-mono-400 mt-1 leading-relaxed">AI로 숏북, 뮤비, 굿즈를 만들 수 있어요 ✨</p>
              <button onClick={()=>setOpenModal("shortbook")} className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-primary-500 text-white hover:bg-primary-600 transition-colors"><Plus className="w-3.5 h-3.5" strokeWidth={2} />지금 만들기</button>
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-2">{creations.map((item)=>{const cfg=TYPE_CONFIG[item.type];const Icon=cfg.icon;return <CreationCard key={item.id} item={item} cfg={cfg} Icon={Icon} onOpen={()=>setOpenModal(item.type as ModalType)} onHeart={()=>handleHeart(item.id)} />;})}</div>
          )}
        </div>
      </div>
      {openModal && <IntroModal type={openModal} bookId={bookId as string} onClose={()=>setOpenModal(null)} onNavigate={(path)=>{setOpenModal(null);router.push(path);}} />}
    </div>
  );
}

function CreationCard({item,cfg,Icon,onOpen,onHeart}:{item:CreationItem;cfg:{label:string;gradient:string;accentColor:string;icon:React.ElementType};Icon:React.ElementType;onOpen:()=>void;onHeart:()=>void}) {
  return (
    <div onClick={onOpen} className="group cursor-pointer rounded-xl overflow-hidden border border-mono-100 hover:border-mono-200 hover:shadow-lg transition-all duration-200">
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

const FEATURE_ICONS: Record<string, ReactNode> = {
  "다른 시점으로": <RefreshCw className="w-5 h-5 text-mono-600" strokeWidth={1.5} />,
  "다른 결말으로": <Sparkles className="w-5 h-5 text-mono-600" strokeWidth={1.5} />,
  "장면 영상화": <Film className="w-5 h-5 text-mono-600" strokeWidth={1.5} />,
  "책갈피": <Bookmark className="w-5 h-5 text-mono-600" strokeWidth={1.5} />,
  "스티커": <Smile className="w-5 h-5 text-mono-600" strokeWidth={1.5} />,
  "일러스트": <ImageIcon className="w-5 h-5 text-mono-600" strokeWidth={1.5} />,
};

function IntroModal({type,bookId,onClose,onNavigate}:{type:"shortbook"|"shortmovie"|"goods";bookId:string;onClose:()=>void;onNavigate:(path:string)=>void}) {
  const configs = {
    shortbook: { title: "숏북 만들기", emoji: "📖", desc: "책의 특정 구간을 AI가 새롭게 재집필해요. 다른 인물의 시점으로 보거나, 결말을 바꾼볼 수 있어요.", features: [{ title: "다른 시점으로", desc: "선택한 인물의 눈으로 이야기를 다시 써요" },{ title: "다른 결말으로", desc: "내가 원하는 방향으로 결말을 바꾽요" }], ctaLabel: "숏북 만들러 가기", ctaClass: "bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)]", path: `/creation/shortbook?bookId=${bookId}` },
    shortmovie: { title: "숏뮤비 만들기", emoji: "🎬", desc: "책 속 장면을 AI가 실제 움직이는 영상으로 만들어줘요. 원하는 구간과 인물을 선택하면 5~8초 영상이 완성돼요.", features: [{ title: "장면 영상화", desc: "텍스트 장면을 720p HD 영상으로 변환해요" }], ctaLabel: "숏뮤비 만들러 가기", ctaClass: "bg-[var(--color-secondary-500)] hover:bg-[var(--color-secondary-600)]", path: `/creation/shortmovie?bookId=${bookId}` },
    goods: { title: "굿즈 만들기", emoji: "🎁", desc: "책에서 마음에 드는 구절이나 장면으로 나만의 굿즈를 만들어요.", features: [{ title: "책갈피", desc: "좋아하는 구절로 나만의 책갈피를 만들어요" },{ title: "스티커", desc: "캐릭터/장면을 AI 일러스트 스티커로" },{ title: "일러스트", desc: "장면을 다양한 스타일의 일러스트로" }], ctaLabel: "굿즈 만들러 가기", ctaClass: "hover:opacity-90", ctaStyle: { backgroundColor: "#f5a623" } as React.CSSProperties, path: `/creation/goods?bookId=${bookId}` },
  };
  const config = configs[type];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-mono-100">
          <div className="flex items-center gap-2"><span className="text-xl">{config.emoji}</span><h2 className="text-lg font-bold text-mono-900">{config.title}</h2></div>
          <button onClick={onClose} className="p-1.5 hover:bg-mono-100 rounded-lg transition-colors"><X className="w-5 h-5 text-mono-500" strokeWidth={1.5} /></button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-mono-600 leading-relaxed">{config.desc}</p>
          <div className="space-y-2.5">
            {config.features.map((feat)=>(<div key={feat.title} className="flex items-start gap-3 p-3 bg-mono-50 rounded-xl"><div className="flex-shrink-0 mt-0.5">{FEATURE_ICONS[feat.title]}</div><div><p className="font-semibold text-sm text-mono-900">{feat.title}</p><p className="text-xs text-mono-500 mt-0.5">{feat.desc}</p></div></div>))}
          </div>
          <button onClick={()=>onNavigate(config.path)} className={`w-full py-3 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${config.ctaClass}`} style={"ctaStyle" in config ? config.ctaStyle : undefined}>{config.ctaLabel}<ChevronRight className="w-4 h-4" strokeWidth={2} /></button>
        </div>
      </div>
    </div>
  );
}
