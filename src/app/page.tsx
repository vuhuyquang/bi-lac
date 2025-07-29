'use client'

import { useState, useEffect } from 'react';
import { supabase, Match } from '@/lib/supabase';

const tabs = [
  { label: 'Nhập Kết Quả' },
  { label: 'Thống Kê' },
  { label: 'Lịch Sử' },
  { label: 'Dữ Liệu' },
];

function calculateStats(matches: Match[]) {
  // Parse and aggregate player stats
  const winCount: Record<string, number> = {};
  const winRate: Record<string, { win: number; total: number }> = {};
  const totalPoints: Record<string, number> = {};
  const totalMatches: Record<string, number> = {};

  matches.forEach((match) => {
    try {
      const [team1Str, team2Str] = match.name.split(' - ');
      const [team1_player1, team1_player2] = team1Str.split(', ').map((p) => p.trim());
      const [team2_player1, team2_player2] = team2Str.split(', ').map((p) => p.trim());
      const [team1_score, team2_score] = match.result.split(' - ').map((s) => parseInt(s.trim()));
      const players = [team1_player1, team1_player2, team2_player1, team2_player2];
      // Tổng số trận
      players.forEach((p) => {
        totalMatches[p] = (totalMatches[p] || 0) + 1;
      });
      // Tổng điểm
      [team1_player1, team1_player2].forEach((p) => {
        totalPoints[p] = (totalPoints[p] || 0) + team1_score;
      });
      [team2_player1, team2_player2].forEach((p) => {
        totalPoints[p] = (totalPoints[p] || 0) + team2_score;
      });
      // Thắng nhiều nhất
      if (team1_score > team2_score) {
        [team1_player1, team1_player2].forEach((p) => {
          winCount[p] = (winCount[p] || 0) + 1;
        });
      } else if (team2_score > team1_score) {
        [team2_player1, team2_player2].forEach((p) => {
          winCount[p] = (winCount[p] || 0) + 1;
        });
      }
      // Tỷ lệ thắng
      [team1_player1, team1_player2].forEach((p) => {
        winRate[p] = winRate[p] || { win: 0, total: 0 };
        winRate[p].total++;
        if (team1_score > team2_score) winRate[p].win++;
      });
      [team2_player1, team2_player2].forEach((p) => {
        winRate[p] = winRate[p] || { win: 0, total: 0 };
        winRate[p].total++;
        if (team2_score > team1_score) winRate[p].win++;
      });
    } catch {}
  });

  // Format for UI
  const mostWins = Object.entries(winCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  const winRateArr = Object.entries(winRate)
    .map(([name, obj]) => ({ name, value: obj.total ? Math.round((obj.win / obj.total) * 1000) / 10 : 0 }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  const totalPointsArr = Object.entries(totalPoints)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  const totalMatchesArr = Object.entries(totalMatches)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return { mostWins, winRate: winRateArr, totalPoints: totalPointsArr, totalMatches: totalMatchesArr };
}

export default function Home() {
  const [activeTab, setActiveTab] = useState(1); // Default to 'Thống Kê'
  const [matches, setMatches] = useState<Match[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase.from('game').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        setMatches(data || []);
        setStats(calculateStats(data || []));
      } catch (err: any) {
        setError(err.message || 'Lỗi không xác định');
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-purple-400 p-2">
      <div className="max-w-4xl mx-auto rounded-2xl shadow-xl bg-white/10 backdrop-blur-md p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 text-center">
          <div className="flex flex-col items-center">
            <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center mb-2 shadow">
              <span className="text-2xl font-bold text-indigo-600">8</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white drop-shadow">Thống Kê Bi Lắc</h1>
            <p className="text-white/90 mt-1 text-sm">Quản lý và thống kê kết quả trận đấu</p>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex border-b border-indigo-200 bg-white/80">
          {tabs.map((tab, idx) => (
            <button
              key={tab.label}
              className={`flex-1 py-3 text-center font-medium transition-colors duration-150 ${
                activeTab === idx
                  ? 'bg-white text-indigo-700 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-indigo-600'
              }`}
              onClick={() => setActiveTab(idx)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {/* Tab Content */}
        <div className="p-6 bg-white/80 min-h-[400px]">
          {activeTab === 1 && (
            loading ? (
              <div className="flex items-center justify-center h-64 text-gray-400 text-xl font-semibold">Đang tải dữ liệu...</div>
            ) : error ? (
              <div className="flex items-center justify-center h-64 text-red-500 text-xl font-semibold">{error}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Tháng Nhiều Nhất */}
                <div className="rounded-xl shadow bg-white p-6">
                  <div className="font-bold text-lg mb-2 flex items-center gap-2">
                    <span role="img" aria-label="trophy">🏆</span> Tháng Nhiều Nhất
                  </div>
                  <ul className="text-gray-700">
                    {stats.mostWins.map((item: any) => (
                      <li key={item.name} className="flex justify-between py-1">
                        <span>{item.name}</span>
                        <span className="font-semibold text-indigo-600">{item.value} tháng</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Tỷ Lệ Thắng */}
                <div className="rounded-xl shadow bg-white p-6">
                  <div className="font-bold text-lg mb-2 flex items-center gap-2">
                    <span role="img" aria-label="target">🎯</span> Tỷ Lệ Thắng
                  </div>
                  <ul className="text-gray-700">
                    {stats.winRate.map((item: any) => (
                      <li key={item.name} className="flex justify-between py-1">
                        <span>{item.name}</span>
                        <span className="font-semibold text-indigo-600">{item.value}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Tổng Điểm */}
                <div className="rounded-xl shadow bg-white p-6">
                  <div className="font-bold text-lg mb-2 flex items-center gap-2">
                    <span role="img" aria-label="lightning">⚡</span> Tổng Điểm
                  </div>
                  <ul className="text-gray-700">
                    {stats.totalPoints.map((item: any) => (
                      <li key={item.name} className="flex justify-between py-1">
                        <span>{item.name}</span>
                        <span className="font-semibold text-indigo-600">{item.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Số Trận */}
                <div className="rounded-xl shadow bg-white p-6 col-span-1 md:col-span-3 max-w-xs md:max-w-none">
                  <div className="font-bold text-lg mb-2 flex items-center gap-2">
                    <span role="img" aria-label="chart">📊</span> Số Trận
                  </div>
                  <ul className="text-gray-700">
                    {stats.totalMatches.map((item: any) => (
                      <li key={item.name} className="flex justify-between py-1">
                        <span>{item.name}</span>
                        <span className="font-semibold text-indigo-600">{item.value} trận</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          )}
          {/* Other tabs can be implemented as needed */}
          {activeTab !== 1 && (
            <div className="flex items-center justify-center h-64 text-gray-400 text-xl font-semibold">
              Chức năng đang phát triển...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
