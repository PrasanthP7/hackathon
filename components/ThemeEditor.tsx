
import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { generateThemeFromImage } from '../services/geminiService';
import { Upload, Rocket, RefreshCw, Loader2, AlertCircle, Edit3, Code, Image as ImageIcon, Save } from 'lucide-react';
import { ThemeConfig } from '../types';

export const ThemeEditor: React.FC = () => {
  const { setPreviewTheme, deployTheme, resetTheme, isCustom, theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'gen' | 'manual' | 'json'>('gen');
  const [copyFeedback, setCopyFeedback] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64String = reader.result as string;
        const newTheme = await generateThemeFromImage(base64String);
        setPreviewTheme(newTheme);
      } catch (err) {
        setError("Failed to generate theme. Try another image.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleColorChange = (section: string, key: string, value: string) => {
    const newTheme: any = { ...theme };
    if (section === 'colors') {
      newTheme.colors[key] = value;
    } else if (section.startsWith('widgets.')) {
        const widgetKey = section.split('.')[1];
        if(!newTheme.widgets[widgetKey]) newTheme.widgets[widgetKey] = {};
        newTheme.widgets[widgetKey][key] = value;
    }
    setPreviewTheme(newTheme);
  };

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(theme, null, 2));
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  return (
    <div className="w-full md:w-96 bg-white border-r border-gray-200 flex flex-col h-full shadow-xl z-20">
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Rocket className="text-blue-600" />
          Theme Studio
        </h2>
        
        {/* Tabs */}
        <div className="flex mt-4 space-x-1 bg-gray-200 p-1 rounded-lg">
          {['gen', 'manual', 'json'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1
                ${activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tab === 'gen' && <ImageIcon size={14} />}
              {tab === 'manual' && <Edit3 size={14} />}
              {tab === 'json' && <Code size={14} />}
              {tab === 'gen' ? 'Generate' : tab === 'manual' ? 'Edit' : 'JSON'}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {activeTab === 'gen' && (
          <div className="space-y-6 animate-fadeIn">
             {/* Upload Section */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <label className="block text-sm font-semibold text-blue-900 mb-2">
                Generate from Image
              </label>
              <p className="text-xs text-blue-700 mb-3">
                Upload your Image.
              </p>
              
              <div className="relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  className="hidden" 
                  id="file-upload"
                  disabled={loading}
                />
                <label 
                  htmlFor="file-upload"
                  className={`flex items-center justify-center gap-2 w-full py-8 px-4 rounded-md border-2 border-dashed border-blue-300 text-blue-600 font-medium cursor-pointer hover:bg-blue-100 transition-colors ${loading ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Upload size={24} />}
                  {loading ? 'Analyzing...' : 'Click to Upload'}
                </label>
              </div>
              {error && (
                <div className="mt-2 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle size={12} /> {error}
                </div>
              )}
            </div>

            {/* Palette Preview */}
             <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Detected Palette</h3>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { label: 'Pri', color: theme.colors.primary },
                  { label: 'Sec', color: theme.colors.secondary },
                  { label: 'Acc', color: theme.colors.accent },
                  { label: 'Neu', color: theme.colors.neutral },
                  { label: 'Bg', color: theme.colors.surface },
                ].map((c) => (
                  <div key={c.label} className="flex flex-col items-center gap-1">
                    <div 
                      className="w-10 h-10 rounded-full shadow-sm border border-gray-100 ring-2 ring-transparent hover:ring-blue-200 transition-all" 
                      style={{ backgroundColor: c.color }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'manual' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-4">
               <h3 className="text-sm font-bold text-gray-700 border-b pb-1">Global Colors</h3>
               <div className="grid grid-cols-2 gap-4">
                 <ColorInput label="Primary" value={theme.colors.primary} onChange={(v) => handleColorChange('colors', 'primary', v)} />
                 <ColorInput label="Secondary" value={theme.colors.secondary} onChange={(v) => handleColorChange('colors', 'secondary', v)} />
                 <ColorInput label="Surface" value={theme.colors.surface} onChange={(v) => handleColorChange('colors', 'surface', v)} />
                 <ColorInput label="Neutral" value={theme.colors.neutral} onChange={(v) => handleColorChange('colors', 'neutral', v)} />
               </div>
            </div>

            {/* <div className="space-y-4">
               <h3 className="text-sm font-bold text-gray-700 border-b pb-1">Widget Overrides</h3>
               <div className="space-y-3">
                 <div className="text-xs text-gray-500 italic">Customize specific widgets</div>
                  */}
                 {/* Date Picker Override */}
                 {/* <div className="bg-gray-50 p-2 rounded border">
                    <span className="text-xs font-bold block mb-2">Date Picker</span>
                    <div className="grid grid-cols-2 gap-2">
                       <ColorInput label="Bg" value={theme.widgets.datePicker?.backgroundColor || theme.widgets.general.backgroundColor || '#fff'} onChange={(v) => handleColorChange('widgets.datePicker', 'backgroundColor', v)} />
                       <ColorInput label="Text" value={theme.widgets.datePicker?.textColor || theme.widgets.general.textColor || '#000'} onChange={(v) => handleColorChange('widgets.datePicker', 'textColor', v)} />
                    </div>
                 </div> */}

                 {/* Carousel Override */}
                 {/* <div className="bg-gray-50 p-2 rounded border">
                    <span className="text-xs font-bold block mb-2">Carousel</span>
                     <div className="grid grid-cols-2 gap-2">
                       <ColorInput label="Bg" value={theme.widgets.carousel?.backgroundColor || theme.widgets.general.backgroundColor || '#fff'} onChange={(v) => handleColorChange('widgets.carousel', 'backgroundColor', v)} />
                       <ColorInput label="Text" value={theme.widgets.carousel?.textColor || theme.widgets.general.textColor || '#000'} onChange={(v) => handleColorChange('widgets.carousel', 'textColor', v)} />
                    </div>
                 </div>

               </div>
            </div> */}
          </div>
        )}

        {activeTab === 'json' && (
          <div className="h-full flex flex-col animate-fadeIn">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase">Live Configuration</h3>
              <button onClick={copyJson} className="text-xs text-blue-600 hover:underline">
                 {copyFeedback ? 'Copied!' : 'Copy JSON'}
              </button>
            </div>
            <pre className="flex-1 bg-gray-900 text-green-400 p-3 rounded-md text-[10px] overflow-auto font-mono leading-relaxed border border-gray-700 shadow-inner max-h-[500px]">
              {JSON.stringify(theme, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="space-y-3">
          {isCustom && (
            <button 
              onClick={deployTheme}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium transition-colors shadow-lg shadow-green-200"
            >
              <Save size={18} />
              Deploy Changes
            </button>
          )}
          
          <button 
            onClick={resetTheme}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium transition-colors"
          >
            <RefreshCw size={18} />
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
};

const ColorInput = ({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] uppercase font-bold text-gray-500">{label}</label>
    <div className="flex gap-2 items-center">
       <input 
        type="color" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 p-0 border-0 rounded cursor-pointer"
      />
      <input 
        type="text" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 text-xs border border-gray-200 rounded p-1 font-mono"
      />
    </div>
  </div>
);
