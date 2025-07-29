'use client'

import { useState, useEffect } from 'react';
import { supabase, Match } from '@/lib/supabase';

const tabs = [
  { label: 'Nhập Kết Quả' },
  { label: 'Thống Kê' },
  { label: 'Lịch Sử' },
  { label: 'Dữ Liệu' },
];

type StatsItem = { name: string; value: number };
type Stats = {
  mostWins: StatsItem[];
  winRate: StatsItem[];
  totalPoints: StatsItem[];
  totalMatches: StatsItem[];
};

function calculateStats(matches: Match[]): Stats {
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
      players.forEach((p) => {
        totalMatches[p] = (totalMatches[p] || 0) + 1;
      });
      [team1_player1, team1_player2].forEach((p) => {
        totalPoints[p] = (totalPoints[p] || 0) + team1_score;
      });
      [team2_player1, team2_player2].forEach((p) => {
        totalPoints[p] = (totalPoints[p] || 0) + team2_score;
      });
      if (team1_score > team2_score) {
        [team1_player1, team1_player2].forEach((p) => {
          winCount[p] = (winCount[p] || 0) + 1;
        });
      } else if (team2_score > team1_score) {
        [team2_player1, team2_player2].forEach((p) => {
          winCount[p] = (winCount[p] || 0) + 1;
        });
      }
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

  const mostWins: StatsItem[] = Object.entries(winCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  const winRateArr: StatsItem[] = Object.entries(winRate)
    .map(([name, obj]) => ({ name, value: obj.total ? Math.round((obj.win / obj.total) * 1000) / 10 : 0 }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  const totalPointsArr: StatsItem[] = Object.entries(totalPoints)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  const totalMatchesArr: StatsItem[] = Object.entries(totalMatches)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return { mostWins, winRate: winRateArr, totalPoints: totalPointsArr, totalMatches: totalMatchesArr };
}

function parseMatchInput(input: string) {
  // VD: Thành, Hải - Cương, Sơn: 100 - 0
  const match = input.match(/^(.+?) - (.+?):\s*(\d+\s*-\s*\d+)$/);
  if (!match) return null;
  return {
    name: `${match[1].trim()} - ${match[2].trim()}`,
    result: match[3].trim(),
  };
}

function AddMatchForm({ onMatchAdded }: { onMatchAdded: () => void }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseMatchInput(input);
    if (!parsed) {
      setMessage('Sai định dạng! Đúng: Thành, Hải - Cương, Sơn: 100 - 0');
      return;
    }
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.from('game').insert(parsed);
    setLoading(false);
    if (error) {
      setMessage('Lỗi khi lưu dữ liệu!');
    } else {
      setMessage('Lưu thành công!');
      setInput('');
      onMatchAdded();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 max-w-lg mx-auto mt-8 flex flex-col gap-4 border border-indigo-100">
      <label className="block text-lg font-bold mb-2 text-indigo-700">Nhập kết quả trận đấu</label>
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        className="w-full border-2 border-indigo-400 rounded-lg px-5 py-3 mb-2 focus:ring-2 focus:ring-indigo-500 text-lg font-semibold text-gray-800 placeholder-gray-400 bg-white outline-none transition shadow-sm"
        placeholder="Thành, Hải - Cương, Sơn: 100 - 0"
        required
      />
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-lg hover:from-indigo-600 hover:to-purple-600 font-semibold text-lg shadow transition"
        disabled={loading}
      >
        {loading ? 'Đang lưu...' : 'Lưu kết quả'}
      </button>
      {message && <div className={`mt-2 text-center text-base ${message.includes('thành công') ? 'text-green-600' : 'text-red-500'}`}>{message}</div>}
      <div className="text-gray-400 text-sm text-center">Định dạng: <span className="font-mono">Thành, Hải - Cương, Sơn: 100 - 0</span></div>
    </form>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState(1); // Default to 'Thống Kê'
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from('game').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setStats(calculateStats(data || []));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-purple-400 p-2">
      <div className="max-w-4xl mx-auto rounded-2xl shadow-xl bg-white/10 backdrop-blur-md p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 text-center">
          <div className="flex flex-col items-center">
            <div className="bg-white rounded-full w-14 h-14 flex items-center justify-center mb-2 shadow-lg border-4 border-indigo-200">
              <span className="text-3xl font-extrabold text-indigo-600 drop-shadow">8</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white drop-shadow-lg tracking-tight">Thống Kê Bi Lắc</h1>
            <p className="text-white/90 mt-2 text-base">Quản lý và thống kê kết quả trận đấu</p>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex border-b border-indigo-200 bg-white/80">
          {tabs.map((tab, idx) => (
            <button
              key={tab.label}
              className={`flex-1 py-4 text-center font-semibold text-lg transition-colors duration-150 ${
                activeTab === idx
                  ? 'bg-white text-indigo-700 border-b-4 border-indigo-600 shadow-inner'
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
          {activeTab === 0 && (
            <AddMatchForm onMatchAdded={fetchStats} />
          )}
          {activeTab === 1 && (
            loading ? (
              <div className="flex items-center justify-center h-64 text-gray-400 text-xl font-semibold">Đang tải dữ liệu...</div>
            ) : error ? (
              <div className="flex items-center justify-center h-64 text-red-500 text-xl font-semibold">{error}</div>
            ) : stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Thắng Nhiều Nhất */}
                <div className="rounded-2xl shadow-lg bg-white p-8 border-t-4 border-indigo-400">
                  <div className="font-bold text-xl mb-3 flex items-center gap-2 text-indigo-700">
                    <span role="img" aria-label="trophy">🏆</span> Thắng Nhiều Nhất
                  </div>
                  <ul className="text-gray-700 text-lg">
                    {stats.mostWins.map((item) => (
                      <li key={item.name} className="flex justify-between py-1">
                        <span>{item.name}</span>
                        <span className="font-semibold text-indigo-600">{item.value} thắng</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Tỷ Lệ Thắng */}
                <div className="rounded-2xl shadow-lg bg-white p-8 border-t-4 border-purple-400">
                  <div className="font-bold text-xl mb-3 flex items-center gap-2 text-purple-700">
                    <span role="img" aria-label="target">🎯</span> Tỷ Lệ Thắng
                  </div>
                  <ul className="text-gray-700 text-lg">
                    {stats.winRate.map((item) => (
                      <li key={item.name} className="flex justify-between py-1">
                        <span>{item.name}</span>
                        <span className="font-semibold text-purple-600">{item.value}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Tổng Điểm */}
                <div className="rounded-2xl shadow-lg bg-white p-8 border-t-4 border-yellow-400">
                  <div className="font-bold text-xl mb-3 flex items-center gap-2 text-yellow-700">
                    <span role="img" aria-label="lightning">⚡</span> Tổng Điểm
                  </div>
                  <ul className="text-gray-700 text-lg">
                    {stats.totalPoints.map((item) => (
                      <li key={item.name} className="flex justify-between py-1">
                        <span>{item.name}</span>
                        <span className="font-semibold text-yellow-600">{item.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Số Trận */}
                <div className="rounded-2xl shadow-lg bg-white p-8 border-t-4 border-pink-400 col-span-1 md:col-span-3 max-w-xs md:max-w-none mx-auto mt-8">
                  <div className="font-bold text-xl mb-3 flex items-center gap-2 text-pink-700">
                    <span role="img" aria-label="chart">📊</span> Số Trận
                  </div>
                  <ul className="text-gray-700 text-lg">
                    {stats.totalMatches.map((item) => (
                      <li key={item.name} className="flex justify-between py-1">
                        <span>{item.name}</span>
                        <span className="font-semibold text-pink-600">{item.value} trận</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          )}
          {/* Other tabs có thể bổ sung sau */}
          {activeTab !== 0 && activeTab !== 1 && (
            <div className="flex items-center justify-center h-64 text-gray-400 text-xl font-semibold">
              Chức năng đang phát triển...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
