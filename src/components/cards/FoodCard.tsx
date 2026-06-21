import React, { useState } from "react";
import { Star, ShieldCheck, Utensils } from "lucide-react";
import Link from "next/link";

interface FoodCardProps {
  id: string;
  name: string;
  price: number;
  calories: number;
  protein: number;
  vendor: string;
  image: string;
  rating?: number;
  isHealthyBadge?: boolean;
}

const FoodCard: React.FC<FoodCardProps> = ({
  id,
  name,
  price,
  calories,
  protein,
  vendor,
  image,
  rating = 4.8,
  isHealthyBadge = true,
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <Link 
      href={`/menus/${id}`} 
      className="card-premium group block transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_24px_rgba(15,82,56,0.08)] hover:border-primary/15"
    >
      <div className="aspect-square relative overflow-hidden bg-muted">
        {!imgFailed && image ? (
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-teal-50 flex flex-col items-center justify-center text-primary/30 p-4">
            <Utensils size={32} className="stroke-[1.5] mb-1" />
            <span className="text-[8px] font-extrabold tracking-widest text-primary/40 uppercase">Meal-It</span>
          </div>
        )}
        {isHealthyBadge && (
          <div className="absolute top-2.5 left-2.5 bg-primary/80 backdrop-blur-md text-white text-[8px] font-bold py-1 px-2.5 rounded-full flex items-center gap-1 shadow-sm">
            <ShieldCheck size={10} className="stroke-[2.5]" />
            HEALTHY
          </div>
        )}
        <div className="absolute bottom-2.5 right-2.5 bg-white/85 backdrop-blur-xs text-foreground text-[10px] font-bold py-1 px-2 rounded-lg flex items-center gap-1 shadow-sm">
          <Star size={10} className="text-warning fill-warning" />
          {rating.toFixed(1)}
        </div>
      </div>
      
      <div className="p-3 flex flex-col gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider truncate">{vendor}</span>
          <div className="min-h-[40px] flex items-start">
            <h3 className="text-sm font-bold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">{name}</h3>
          </div>
        </div>
        
        <div className="flex gap-1.5 text-[9px] items-center mt-0.5">
          <span className="bg-orange-50 text-orange-600 border border-orange-100 px-2 py-0.5 rounded font-extrabold flex items-center gap-0.5 shadow-2xs">
            🔥 {calories} kkal
          </span>
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded font-extrabold flex items-center gap-0.5 shadow-2xs">
            💪 {protein}g Prot
          </span>
        </div>
        
        <div className="text-base font-extrabold text-budget mt-1">
          Rp {price.toLocaleString('id-ID')}
        </div>
      </div>
    </Link>
  );
};

export default FoodCard;

