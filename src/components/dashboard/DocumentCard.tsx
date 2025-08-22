// ✅ BULLETPROOF DocumentCard Component - NO SSR ERRORS
function DocumentCard({ 
  document, 
  viewMode, 
  selected, 
  onSelect, 
  onEdit, 
  onView, 
  onDuplicate, 
  onShare, 
  onDelete,
  inlineEditing,
  inlineEditTitle,
  onInlineEditStart,
  onInlineEditSave,
  onInlineEditCancel,
  onInlineEditChange
}: any) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const canEdit = document.userRole === 'owner' || document.userRole === 'editor';
  const canDelete = document.userRole === 'owner';

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };

  const handleActionClick = (action: () => void) => {
    return (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDropdownOpen(false);
      action();
    };
  };

  // ✅ COMPLETELY REMOVE useEffect - Use onBlur instead
  const handleDropdownBlur = (e: React.FocusEvent) => {
    // Close dropdown when focus leaves the dropdown container
    setTimeout(() => {
      if (dropdownRef.current && !dropdownRef.current.contains(document.activeElement)) {
        setDropdownOpen(false);
      }
    }, 100);
  };

  if (viewMode === 'list') {
    return (
      <div className={`flex items-center space-x-4 p-4 border rounded-lg hover:shadow-md transition-shadow ${
        isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'
      } ${selected ? 'ring-2 ring-indigo-500' : ''}`}>
        
        {onSelect && (
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
            className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
            onClick={(e) => e.stopPropagation()}
          />
        )}

        <div className="flex-shrink-0">
          <FileText className={`w-8 h-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
        </div>

        <div className="flex-1 min-w-0" onClick={() => canEdit ? onEdit() : onView()}>
          {inlineEditing ? (
            <input
              type="text"
              value={inlineEditTitle}
              onChange={(e) => onInlineEditChange?.(e.target.value)}
              onBlur={() => onInlineEditSave?.(inlineEditTitle)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onInlineEditSave?.(inlineEditTitle);
                if (e.key === 'Escape') onInlineEditCancel?.();
              }}
              className={`text-lg font-medium bg-transparent border-b-2 border-indigo-500 focus:outline-none ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <h3 className={`text-lg font-medium truncate cursor-pointer ${
              isDark ? 'text-white hover:text-indigo-400' : 'text-gray-900 hover:text-indigo-600'
            }`}>
              {document.title}
            </h3>
          )}
          
          <div className="flex items-center space-x-4 mt-1 text-sm">
            <span className={`flex items-center space-x-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <Calendar className="w-4 h-4" />
              <span>{new Date(document.updated_at).toLocaleDateString()}</span>
            </span>
            
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              document.userRole === 'owner' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                : document.userRole === 'editor'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}>
              {document.userRole}
            </span>

            {document.is_public && (
              <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                Public
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {canEdit ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className={`p-2 rounded hover:bg-gray-100 ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-500'}`}
              title="Edit"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView();
              }}
              className={`p-2 rounded hover:bg-gray-100 ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-500'}`}
              title="View"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}

          {/* ✅ FIXED: Dropdown using onBlur instead of useEffect */}
          <div className="relative" ref={dropdownRef} onBlur={handleDropdownBlur}>
            <button 
              onClick={handleDropdownClick}
              className={`p-2 rounded hover:bg-gray-100 ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-500'}`}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            
            {dropdownOpen && (
              <div className={`absolute right-0 mt-1 w-48 rounded-lg shadow-lg border z-50 ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className="py-1">
                  <button
                    onMouseDown={handleActionClick(onDuplicate)}
                    className={`w-full flex items-center space-x-2 px-4 py-2 text-sm text-left hover:bg-gray-50 ${
                      isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700'
                    }`}
                  >
                    <Copy className="w-4 h-4" />
                    <span>Duplicate</span>
                  </button>
                  
                  <button
                    onMouseDown={handleActionClick(onShare)}
                    className={`w-full flex items-center space-x-2 px-4 py-2 text-sm text-left hover:bg-gray-50 ${
                      isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700'
                    }`}
                  >
                    <Share className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                  
                  {canDelete && (
                    <button
                      onMouseDown={handleActionClick(onDelete)}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className={`relative p-6 border rounded-lg hover:shadow-md transition-shadow ${
      isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'
    } ${selected ? 'ring-2 ring-indigo-500' : ''}`}>
      
      {onSelect && (
        <div className="absolute top-4 left-4">
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
            className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <FileText className={`w-8 h-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
        
        {/* ✅ FIXED: Dropdown using onBlur instead of useEffect */}
        <div className="relative" ref={dropdownRef} onBlur={handleDropdownBlur}>
          <button 
            onClick={handleDropdownClick}
            className={`p-1 rounded hover:bg-gray-100 ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'text-gray-500'}`}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          
          {dropdownOpen && (
            <div className={`absolute right-0 mt-1 w-48 rounded-lg shadow-lg border z-50 ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="py-1">
                <button
                  onMouseDown={handleActionClick(onDuplicate)}
                  className={`w-full flex items-center space-x-2 px-4 py-2 text-sm text-left hover:bg-gray-50 ${
                    isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700'
                  }`}
                >
                  <Copy className="w-4 h-4" />
                  <span>Duplicate</span>
                </button>
                
                <button
                  onMouseDown={handleActionClick(onShare)}
                  className={`w-full flex items-center space-x-2 px-4 py-2 text-sm text-left hover:bg-gray-50 ${
                    isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700'
                  }`}
                >
                  <Share className="w-4 h-4" />
                  <span>Share</span>
                </button>
                
                {canDelete && (
                  <button
                    onMouseDown={handleActionClick(onDelete)}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div onClick={() => canEdit ? onEdit() : onView()} className="cursor-pointer">
        {inlineEditing ? (
          <input
            type="text"
            value={inlineEditTitle}
            onChange={(e) => onInlineEditChange?.(e.target.value)}
            onBlur={() => onInlineEditSave?.(inlineEditTitle)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onInlineEditSave?.(inlineEditTitle);
              if (e.key === 'Escape') onInlineEditCancel?.();
            }}
            className={`text-lg font-medium bg-transparent border-b-2 border-indigo-500 focus:outline-none w-full ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {document.title}
          </h3>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {new Date(document.updated_at).toLocaleDateString()}
          </span>
          
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              document.userRole === 'owner' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                : document.userRole === 'editor'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            }`}>
              {document.userRole}
            </span>

            {document.is_public && (
              <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                Public
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
