import React, { useState } from 'react';
import { 
  Bot, Send, Sparkles, CornerDownLeft, CheckCircle2, AlertTriangle, 
  Lightbulb, ArrowRight, X, Compass 
} from 'lucide-react';
import api from '../../services/api';

export function ArchNovaCopilot({ currentDesign, onApplyDesign, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I am ArchNova Copilot, your computational architectural assistant. Tell me your plot dimensions, desired storeys, bedroom counts, or style preferences, and I'll synthesize a 3D parametric concept for you.",
      suggestedDesign: null,
      tradeoffs: []
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const samplePrompts = [
    "Design a modern two-floor home on a 30 m by 20 m plot with parking.",
    "Create a three-bedroom layout with a balcony and rooftop terrace.",
    "Design a minimalist 1-floor bungalow on a 25x30 plot.",
    "Suggest ways to maximize usable floor area on a 20m x 25m site."
  ];

  const handleSend = async (textToSend = null) => {
    const prompt = textToSend || inputPrompt;
    if (!prompt.trim()) return;

    // Add user message
    const newMessages = [...messages, { role: 'user', content: prompt }];
    setMessages(newMessages);
    setInputPrompt('');
    setIsThinking(true);

    try {
      const response = await api.queryCopilot(prompt, currentDesign);
      
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: response.explanation || "I've synthesized a parametric architectural configuration matching your specifications.",
          suggestedDesign: response.suggested_design,
          extracted: response.extracted_parameters,
          tradeoffs: response.tradeoffs_and_limitations || []
        }
      ]);
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: "I encountered an issue processing your query. Please check plot numbers or try one of the prompt suggestions below.",
          suggestedDesign: null,
          tradeoffs: []
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E6E4DE] shadow-xl flex flex-col h-full max-h-[640px] overflow-hidden">
      {/* Header */}
      <div className="border-b border-[#E6E4DE] bg-[#1C2028] px-5 py-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#D35400] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold flex items-center gap-1.5">
              <span>ArchNova Copilot</span>
              <span className="text-[10px] font-semibold bg-[#2E3543] text-orange-400 px-1.5 py-0.5 rounded">
                Parametric AI
              </span>
            </h3>
            <span className="text-[11px] text-gray-400">Natural-Language Generative Architecture</span>
          </div>
        </div>

        {onClose && (
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Chat Messages */}
      <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs bg-[#FBFBFA]">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed shadow-sm ${
                m.role === 'user'
                  ? 'bg-[#1C2028] text-white rounded-br-none'
                  : 'bg-white border border-[#E6E4DE] text-[#1C2028] rounded-bl-none'
              }`}
            >
              <p>{m.content}</p>

              {/* Extracted params pills */}
              {m.extracted && Object.keys(m.extracted).length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-gray-100 flex flex-wrap gap-1.5">
                  {Object.entries(m.extracted).map(([k, v]) => (
                    <span key={k} className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-mono">
                      {k.replace(/_/g, ' ')}: <strong>{String(v)}</strong>
                    </span>
                  ))}
                </div>
              )}

              {/* Tradeoffs & Architectural Caveats */}
              {m.tradeoffs && m.tradeoffs.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-gray-100 text-[10px] text-[#5C626F] space-y-1">
                  <span className="font-bold text-[#1C2028] block">Considerations & Planning Caveats:</span>
                  {m.tradeoffs.map((t, i) => (
                    <p key={i}>• {t}</p>
                  ))}
                </div>
              )}

              {/* Apply Design Action Button */}
              {m.suggestedDesign && onApplyDesign && (
                <div className="mt-3 pt-2.5 border-t border-gray-200">
                  <button
                    onClick={() => onApplyDesign(m.suggestedDesign)}
                    className="w-full py-2 px-3 rounded-xl bg-[#D35400] hover:bg-[#B84700] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-98"
                  >
                    <span>Apply Generated 3D Parameters</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-gray-200 w-fit">
            <div className="w-3 h-3 bg-[#D35400] rounded-full animate-bounce" />
            <div className="w-3 h-3 bg-[#D35400] rounded-full animate-bounce [animation-delay:0.2s]" />
            <div className="w-3 h-3 bg-[#D35400] rounded-full animate-bounce [animation-delay:0.4s]" />
            <span className="text-xs text-[#5C626F] ml-1">Synthesizing spatial constraints...</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompt Pills */}
      <div className="px-4 py-2 border-t border-[#E6E4DE] bg-[#F4F2EC] flex items-center gap-1.5 overflow-x-auto whitespace-nowrap">
        <Lightbulb className="w-3.5 h-3.5 text-[#D35400] shrink-0" />
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-white border border-[#D5D3CC] hover:border-[#D35400] text-[#1C2028] font-medium transition shrink-0"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-3 bg-white border-t border-[#E6E4DE]">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="e.g. Design a 3-bedroom modern villa on a 25x30m plot with balcony"
            className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-[#D5D3CC] focus:outline-none focus:border-[#D35400]"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputPrompt.trim() || isThinking}
            className="p-2.5 rounded-xl bg-[#D35400] hover:bg-[#B84700] text-white disabled:opacity-50 transition shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
