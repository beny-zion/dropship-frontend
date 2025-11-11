'use client';

import { Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTags } from '@/lib/hooks/useTags';

export default function PopularTags({ limit = 10 }) {
  const router = useRouter();
  const { tags, loading, error } = useTags(limit);

  if (loading) {
    return (
      <div className="w-full px-4 md:px-8 lg:px-12 py-8 bg-neutral-50">
        <div className="container mx-auto">
          <div className="flex gap-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-10 w-24 bg-neutral-200 animate-pulse rounded-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !tags || tags.length === 0) {
    return null;
  }

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 py-8 bg-neutral-50">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Tag className="h-5 w-5 text-neutral-600" />
          <h2 className="text-lg font-light tracking-widest uppercase text-neutral-800">
            תגים פופולריים
          </h2>
        </div>

        {/* Tags Grid */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tagObj) => (
            <button
              key={tagObj.tag}
              onClick={() => router.push(`/products?tags=${encodeURIComponent(tagObj.tag)}`)}
              className="group px-5 py-2.5 text-sm font-light tracking-wide bg-white hover:bg-black hover:text-white transition-all rounded-full border border-neutral-200 hover:border-black"
            >
              <span className="flex items-center gap-2">
                {tagObj.tag}
                <span className="text-xs text-neutral-400 group-hover:text-white/80">
                  ({tagObj.count})
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
