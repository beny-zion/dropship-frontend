'use client';

import { useState, useRef, useEffect } from 'react';
import { useTags } from '@/lib/hooks/useTags';
import { X, Tag, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function TagInput({ value = '', onChange, label, placeholder }) {
  const { tags: popularTags, loading } = useTags(30); // Get top 30 tags
  const [inputValue, setInputValue] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Initialize selectedTags from value prop
  useEffect(() => {
    if (value && typeof value === 'string') {
      const tags = value.split(',').map(t => t.trim()).filter(Boolean);
      setSelectedTags(tags);
    }
  }, [value]);

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue.trim() && popularTags.length > 0) {
      const filtered = popularTags
        .filter(tagObj =>
          tagObj.tag.toLowerCase().includes(inputValue.toLowerCase()) &&
          !selectedTags.includes(tagObj.tag)
        )
        .slice(0, 8); // Limit to 8 suggestions
      setFilteredSuggestions(filtered);
    } else if (!inputValue.trim() && popularTags.length > 0 && showSuggestions) {
      // Show all popular tags when focused and empty
      const filtered = popularTags
        .filter(tagObj => !selectedTags.includes(tagObj.tag))
        .slice(0, 10);
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions([]);
    }
  }, [inputValue, popularTags, selectedTags, showSuggestions]);

  // Update parent component
  const updateParent = (tags) => {
    const tagsString = tags.join(', ');
    onChange(tagsString);
  };

  // Add tag
  const addTag = (tag) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      const newTags = [...selectedTags, trimmedTag];
      setSelectedTags(newTags);
      updateParent(newTags);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  // Remove tag
  const removeTag = (tagToRemove) => {
    const newTags = selectedTags.filter(tag => tag !== tagToRemove);
    setSelectedTags(newTags);
    updateParent(newTags);
  };

  // Handle key press
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      // Remove last tag on backspace if input is empty
      removeTag(selectedTags[selectedTags.length - 1]);
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-2">
      {label && (
        <Label className="flex items-center gap-2">
          <Tag className="h-4 w-4" />
          {label}
        </Label>
      )}

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input with Suggestions */}
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder || 'הקלד תג חדש או בחר מהרשימה...'}
          className="pr-10"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Plus className="h-4 w-4 text-gray-400" />
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            <div className="p-2 bg-gray-50 border-b border-gray-200">
              <p className="text-xs text-gray-600 font-medium">
                💡 תגים פופולריים ({filteredSuggestions.length})
              </p>
            </div>
            <div className="p-1">
              {filteredSuggestions.map((tagObj) => (
                <button
                  key={tagObj.tag}
                  type="button"
                  onClick={() => addTag(tagObj.tag)}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-blue-50 rounded-md transition-colors text-right"
                >
                  <span className="text-sm font-medium text-gray-900">
                    {tagObj.tag}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {tagObj.count} מוצרים
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Helper Text */}
      <div className="flex items-start gap-2 text-xs text-gray-500">
        <div className="flex-1">
          <p className="mb-1">💡 <strong>טיפים:</strong></p>
          <ul className="space-y-0.5 pr-4">
            <li>• לחץ על תג מהרשימה להוספה מהירה</li>
            <li>• הקלד תג חדש ולחץ Enter להוסיף</li>
            <li>• השתמש בתגים עקביים לשיפור החיפוש</li>
          </ul>
        </div>
        {selectedTags.length > 0 && (
          <div className="text-left">
            <span className="font-semibold text-blue-600">
              {selectedTags.length} תגים נבחרו
            </span>
          </div>
        )}
      </div>

      {/* Popular Tags Quick Add */}
      {!showSuggestions && popularTags.length > 0 && selectedTags.length < 5 && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs font-semibold text-blue-900 mb-2">
            🔥 תגים מומלצים (לחץ להוספה):
          </p>
          <div className="flex flex-wrap gap-1.5">
            {popularTags
              .filter(tagObj => !selectedTags.includes(tagObj.tag))
              .slice(0, 8)
              .map((tagObj) => (
                <button
                  key={tagObj.tag}
                  type="button"
                  onClick={() => addTag(tagObj.tag)}
                  className="px-2.5 py-1 bg-white hover:bg-blue-100 border border-blue-300 rounded-full text-xs font-medium text-blue-700 transition-colors"
                >
                  {tagObj.tag} ({tagObj.count})
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
