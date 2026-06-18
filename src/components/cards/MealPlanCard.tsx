import React from "react";
import { Clock, Info } from "lucide-react";
import Link from "next/link";

interface MealPlanCardProps {
  id?: string;
  time: string;
  name: string;
  calories: number;
  protein: number;
  image: string;
  price: number;
}

const MealPlanCard: React.FC<MealPlanCardProps> = ({
  id,
  time,
  name,
  calories,
  protein,
  image,
  price,
}) => {
  return (
    <div className="card-premium flex gap-4 p-3 items-center">
      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
        <img src={image} alt={name} className="w-full h-full object-cover" />
      </div>
      
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase">
          <Clock size={10} />
          {time}
        </div>
        <h3 className="text-sm font-bold text-text-primary line-clamp-1">{name}</h3>
        
        <div className="flex items-center gap-2 text-[10px] text-text-muted">
          <span>{calories} kkal</span>
          <span>•</span>
          <span>{protein}g protein</span>
        </div>
        
        <div className="text-sm font-bold text-budget">
          Rp {price.toLocaleString('id-ID')}
        </div>
      </div>
      
      {id ? (
        <Link 
          href={`/menus/${id}`} 
          className="p-2 text-text-muted bg-muted hover:bg-primary/10 hover:text-primary transition-colors rounded-full"
        >
          <Info size={16} />
        </Link>
      ) : (
        <button className="p-2 text-text-muted bg-muted rounded-full">
          <Info size={16} />
        </button>
      )}
    </div>
  );
};

export default MealPlanCard;
