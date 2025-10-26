import Link from 'next/link';
import { Plane, MapPin, Calendar } from 'lucide-react';
import { Delegation } from '@/logic/rules';

interface DelegationCardProps {
  delegation: Delegation;
}

export function DelegationCard({ delegation }: DelegationCardProps) {
  return (
    <Link href={`/delegations/${delegation.id}`}>
      <div className="card p-6 space-y-4 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-200 group cursor-pointer">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-semibold text-neutral-900 group-hover:text-neutral-700 transition-colors">
            {delegation.title}
          </h3>
          <Plane className="w-5 h-5 text-blue-600 group-hover:text-blue-500 transition-colors" />
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-neutral-600">
            <MapPin className="w-4 h-4 text-neutral-400" />
            <span className="text-sm">{delegation.destination_city}, {delegation.destination_country}</span>
          </div>
          
          <div className="flex items-center gap-2 text-neutral-600">
            <Calendar className="w-4 h-4 text-neutral-400" />
            <span className="text-sm">{delegation.start_date} - {delegation.end_date}</span>
          </div>
        </div>
        
        <p className="text-sm text-neutral-500 leading-relaxed">{delegation.purpose}</p>
        
        <div className="pt-2 border-t border-neutral-100">
          <span className="text-xs text-neutral-400 font-medium">
            {delegation.daily_allowance} EUR/day allowance
          </span>
        </div>
      </div>
    </Link>
  );
}
