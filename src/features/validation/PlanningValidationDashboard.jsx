import React from 'react';
import { 
  ShieldCheck, AlertTriangle, AlertCircle, CheckCircle, BarChart3, 
  Ruler, Maximize, Layers, Car, Info, Sparkles 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

export function PlanningValidationDashboard({ validationResult, designData }) {
  if (!validationResult) return null;

  const {
    is_valid,
    status,
    plot_area_sqm,
    plot_area_sqft,
    buildable_width,
    buildable_depth,
    proposed_footprint_sqm,
    site_coverage_pct,
    max_site_coverage_pct,
    coverage_compliant,
    proposed_total_floor_area_sqm,
    max_permitted_floor_area_sqm,
    proposed_far,
    max_far,
    far_compliant,
    proposed_height_m,
    max_permitted_height_m,
    height_compliant,
    proposed_floors,
    max_floors,
    floors_compliant,
    parking_provided,
    parking_required,
    parking_compliant,
    setbacks_compliant,
    warnings = [],
    recommendations = [],
    disclaimer
  } = validationResult;

  // Chart data for Area Comparison
  const areaData = [
    {
      name: 'Site Coverage',
      Proposed: proposed_footprint_sqm,
      Permitted: Math.round(plot_area_sqm * (max_site_coverage_pct / 100)),
      unit: 'm²'
    },
    {
      name: 'Total Floor Area',
      Proposed: proposed_total_floor_area_sqm,
      Permitted: max_permitted_floor_area_sqm,
      unit: 'm²'
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#E6E4DE] p-6 shadow-sm space-y-6">
      {/* Header & Status Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6E4DE] pb-4">
        <div>
          <span className="text-[11px] font-bold text-[#D35400] uppercase tracking-wider block">
            Algorithmic Planning Verification
          </span>
          <h3 className="text-lg font-bold text-[#1C2028]">Planning Constraints & Compliance</h3>
        </div>

        {/* Status Badge */}
        <div className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
          is_valid && warnings.length === 0
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            : is_valid
            ? 'bg-amber-50 text-amber-800 border border-amber-200'
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {is_valid && warnings.length === 0 ? (
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          ) : is_valid ? (
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          )}
          <span>{status}</span>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Metric 1: FAR */}
        <div className={`p-4 rounded-xl border ${far_compliant ? 'bg-[#FBFBFA] border-[#E6E4DE]' : 'bg-rose-50 border-rose-200'}`}>
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-[#5C626F] uppercase">FAR / FSI Ratio</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${far_compliant ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-200 text-rose-900'}`}>
              {far_compliant ? 'Compliant' : 'Exceeded'}
            </span>
          </div>
          <p className="text-2xl font-black text-[#1C2028] mt-1">{proposed_far}</p>
          <span className="text-[11px] text-[#8E95A5]">Max Permitted: {max_far}</span>
        </div>

        {/* Metric 2: Site Coverage */}
        <div className={`p-4 rounded-xl border ${coverage_compliant ? 'bg-[#FBFBFA] border-[#E6E4DE]' : 'bg-rose-50 border-rose-200'}`}>
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-[#5C626F] uppercase">Site Coverage</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${coverage_compliant ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-200 text-rose-900'}`}>
              {coverage_compliant ? 'Compliant' : 'Exceeded'}
            </span>
          </div>
          <p className="text-2xl font-black text-[#1C2028] mt-1">{site_coverage_pct}%</p>
          <span className="text-[11px] text-[#8E95A5]">Max Limit: {max_site_coverage_pct}%</span>
        </div>

        {/* Metric 3: Building Height */}
        <div className={`p-4 rounded-xl border ${height_compliant ? 'bg-[#FBFBFA] border-[#E6E4DE]' : 'bg-rose-50 border-rose-200'}`}>
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-[#5C626F] uppercase">Building Height</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${height_compliant ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-200 text-rose-900'}`}>
              {height_compliant ? 'Compliant' : 'Exceeded'}
            </span>
          </div>
          <p className="text-2xl font-black text-[#1C2028] mt-1">{proposed_height_m}m</p>
          <span className="text-[11px] text-[#8E95A5]">{proposed_floors} storeys (max {max_floors})</span>
        </div>

        {/* Metric 4: Parking */}
        <div className={`p-4 rounded-xl border ${parking_compliant ? 'bg-[#FBFBFA] border-[#E6E4DE]' : 'bg-amber-50 border-amber-200'}`}>
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-[#5C626F] uppercase">Parking Bays</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${parking_compliant ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-200 text-amber-900'}`}>
              {parking_compliant ? 'Compliant' : 'Warning'}
            </span>
          </div>
          <p className="text-2xl font-black text-[#1C2028] mt-1">{parking_provided}</p>
          <span className="text-[11px] text-[#8E95A5]">Required: {parking_required} stalls</span>
        </div>
      </div>

      {/* Visual Chart Comparison */}
      <div className="p-4 rounded-xl bg-[#FBFBFA] border border-[#E6E4DE]">
        <h4 className="text-xs font-bold text-[#1C2028] mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#D35400]" />
          <span>Spatial Budget vs Permitted Allowance (m²)</span>
        </h4>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={areaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#5C626F' }} />
              <YAxis tick={{ fontSize: 10, fill: '#8E95A5' }} />
              <Tooltip
                contentStyle={{ background: '#1C2028', color: '#fff', borderRadius: '8px', fontSize: '11px', border: 'none' }}
              />
              <Bar dataKey="Proposed" fill="#D35400" radius={[4, 4, 0, 0]} name="Proposed Area" />
              <Bar dataKey="Permitted" fill="#94A3B8" radius={[4, 4, 0, 0]} name="Permitted Max" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Check Table */}
      <div className="border border-[#E6E4DE] rounded-xl overflow-hidden text-xs">
        <table className="w-full text-left">
          <thead className="bg-[#F4F2EC] text-[#5C626F] font-semibold border-b border-[#E6E4DE]">
            <tr>
              <th className="py-2.5 px-3.5">Constraint Parameter</th>
              <th className="py-2.5 px-3.5">User Criterion</th>
              <th className="py-2.5 px-3.5">Proposed Design</th>
              <th className="py-2.5 px-3.5">Compliance Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6E4DE]">
            <tr>
              <td className="py-2.5 px-3.5 font-medium text-[#1C2028]">Buildable Footprint</td>
              <td className="py-2.5 px-3.5 text-[#5C626F]">Max {Math.round(plot_area_sqm * (max_site_coverage_pct / 100))} m²</td>
              <td className="py-2.5 px-3.5 font-bold">{proposed_footprint_sqm} m²</td>
              <td className="py-2.5 px-3.5">
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${coverage_compliant ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}>
                  {coverage_compliant ? '✓ Compliant' : '✕ Exceeded'}
                </span>
              </td>
            </tr>
            <tr>
              <td className="py-2.5 px-3.5 font-medium text-[#1C2028]">Gross Floor Area (FAR)</td>
              <td className="py-2.5 px-3.5 text-[#5C626F]">Max {max_permitted_floor_area_sqm} m² (FAR {max_far})</td>
              <td className="py-2.5 px-3.5 font-bold">{proposed_total_floor_area_sqm} m² (FAR {proposed_far})</td>
              <td className="py-2.5 px-3.5">
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${far_compliant ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}>
                  {far_compliant ? '✓ Compliant' : '✕ Exceeded'}
                </span>
              </td>
            </tr>
            <tr>
              <td className="py-2.5 px-3.5 font-medium text-[#1C2028]">Setback Clearances</td>
              <td className="py-2.5 px-3.5 text-[#5C626F]">Plot {plot_area_sqm} m²</td>
              <td className="py-2.5 px-3.5 font-bold">Envelope {buildable_width}m × {buildable_depth}m</td>
              <td className="py-2.5 px-3.5">
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${setbacks_compliant ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}>
                  {setbacks_compliant ? '✓ Non-Encroaching' : '✕ Encroached'}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Warnings & Recommendations */}
      {(warnings.length > 0 || recommendations.length > 0) && (
        <div className="space-y-3">
          {warnings.map((w, i) => (
            <div key={`w-${i}`} className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>{w}</span>
            </div>
          ))}
          {recommendations.map((rec, i) => (
            <div key={`r-${i}`} className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>{rec}</span>
            </div>
          ))}
        </div>
      )}

      {/* Official Disclaimer */}
      <div className="p-3.5 rounded-xl bg-[#F4F2EC] border border-[#E6E4DE] text-[11px] text-[#5C626F] leading-relaxed flex items-start gap-2">
        <Info className="w-4 h-4 text-[#8E95A5] shrink-0 mt-0.5" />
        <p>{disclaimer}</p>
      </div>
    </div>
  );
}
