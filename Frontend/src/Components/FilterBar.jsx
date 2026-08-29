import { useRef } from "react";
import { Funnel, ChevronDown, ChevronRight } from "lucide-react";

export default function FilterBar() {
  const scrollRef = useRef(null);

  const filters = [
    "Newly Joined",
    "Not seen",
    "Profiles with photo",
    "Mutual Matches",
    "Online Now",
    "Verified Profiles",
    "Premium",
    "Recently Active",
    "Nearby",
    "Top Matches",
  ];

  const scrollRight = () => {
    scrollRef.current?.scrollBy({
      left: 250,
      behavior: "smooth",
    });
  };

  return (
    <div className="mt-5 w-full max-w-[1024px] flex items-center gap-3">
      {/* Fixed Buttons */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <button className="h-[40px] px-5 bg-[#8f122d] text-white rounded-xl flex items-center gap-3">
          <Funnel size={20} />
          Filters
        </button>

        <button className="h-[40px] px-5 rounded-xl bg-white outline outline-1 outline-[#F1AEB4] flex items-center gap-3">
          Sort by
          <ChevronDown size={18} />
        </button>
      </div>

      {/* Scrollable Filter Chips */}
      <div className="relative flex-1 min-w-0">
        <div
          ref={scrollRef}
          className="flex items-center gap-3 overflow-x-auto whitespace-nowrap pr-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {filters.map((item) => (
            <button
              key={item}
              className="h-[40px] px-6 rounded-full border border-[#e3b8c0] bg-white flex-shrink-0"
            >
              {item}
            </button>
          ))}
        </div>

        {/* Fixed Arrow */}
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border bg-white flex items-center justify-center shadow-md"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}