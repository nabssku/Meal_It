import React from "react";
import { Star, ShieldCheck } from "lucide-react";
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
  return (
    <Link href={`/menus/${id}`} className="card-premium group">
      <div className="aspect-square relative overflow-hidden bg-muted">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
        {isHealthyBadge && (
          <div className="absolute top-2 left-2 bg-primary/90 text-white text-[8px] font-bold py-1 px-2 rounded-full flex items-center gap-1">
            <ShieldCheck size={10} />
            HEALTHY
          </div>
        )}
        <div className="absolute bottom-2 right-2 bg-white/90 text-text-primary text-[10px] font-bold py-1 px-2 rounded-lg flex items-center gap-1 shadow-sm">
          <Star size={10} className="text-warning fill-warning" />
          {rating}
        </div>
      </div>
      
      <div className="p-3 flex flex-col gap-2">
        <div className="flex flex-col">
          <span className="text-[10px] text-text-muted font-medium uppercase truncate">{vendor}</span>
          <h3 className="text-sm font-bold text-text-primary line-clamp-1 group-hover:text-primary transition-colors">{name}</h3>
        </div>
        
        <div className="flex gap-2 text-[10px] items-center">
            <span className="bg-success/10 text-success px-1.5 py-0.5 rounded font-bold">{calories} kkal</span>
            <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">{protein}g Prot</span>
        </div>
        
        <div className="text-base font-bold text-budget mt-1">
          Rp {price.toLocaleString('id-ID')}
        </div>
      </div>
    </Link>
  );
};

export default FoodCard;
