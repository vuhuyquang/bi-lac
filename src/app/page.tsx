'use client';

import { useState, useEffect } from 'react';
import { supabase, Match } from '@/lib/supabase';

const tabs = [
  { label: 'Nhập Kết Quả' },
  { label: 'Thống Kê' },
  { label: 'Lịch Sử' },
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
      const [team1_player1, team1_player2] = team1Str.split(',').map((p) => p.trim());
      const [team2_player1, team2_player2] = team2Str.split(',').map((p) => p.trim());
      const [team1_score, team2_score] = match.result.split('-').map((s) => parseInt(s.trim()));

      // Cộng số trận cho từng người
      [team1_player1, team1_player2, team2_player1, team2_player2].forEach((p) => {
        totalMatches[p] = (totalMatches[p] || 0) + 1;
      });

      // Cộng điểm cho từng người đúng đội
      [team1_player1, team1_player2].forEach((p) => {
        totalPoints[p] = (totalPoints[p] || 0) + team1_score;
      });
      [team2_player1, team2_player2].forEach((p) => {
        totalPoints[p] = (totalPoints[p] || 0) + team2_score;
      });

      // Cộng số trận thắng cho đúng đội thắng
      if (team1_score > team2_score) {
        [team1_player1, team1_player2].forEach((p) => {
          winCount[p] = (winCount[p] || 0) + 1;
        });
      } else if (team2_score > team1_score) {
        [team2_player1, team2_player2].forEach((p) => {
          winCount[p] = (winCount[p] || 0) + 1;
        });
      }

      // Cộng số trận và số trận thắng cho tỷ lệ thắng
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
    .map(([name, obj]) => ({
      name,
      value: obj.total ? Math.round((obj.win / obj.total) * 1000) / 10 : 0,
    }))
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
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 max-w-md mx-auto mt-6 flex flex-col gap-3"
    >
      <label className="block text-base font-semibold mb-1 text-gray-700">Nhập kết quả trận đấu</label>
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        className="w-full border border-gray-300 rounded px-3 py-2 text-base font-medium text-gray-800 placeholder-gray-400 bg-white outline-none focus:ring-2 focus:ring-blue-200 transition"
        placeholder="Thành, Hải - Cương, Sơn: 100 - 0"
        required
      />
      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 rounded font-semibold hover:bg-blue-600 transition"
        disabled={loading}
      >
        {loading ? 'Đang lưu...' : 'Lưu kết quả'}
      </button>
      {message && (
        <div className={`mt-1 text-center text-sm ${message.includes('thành công') ? 'text-green-600' : 'text-red-500'}`}>
          {message}
        </div>
      )}
      <div className="text-gray-400 text-xs text-center">
        Định dạng: <span className="font-mono">Thành, Hải - Cương, Sơn: 100 - 0</span>
      </div>
    </form>
  );
}

function MatchHistory({ matches }: { matches: Match[] }) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);
  if (!matches.length) {
    return <div className="text-gray-400 text-center py-8">Chưa có dữ liệu trận đấu nào.</div>;
  }
  return (
    <div className="max-w-2xl mx-auto mt-4">
      <ul className="divide-y divide-gray-100 bg-white border border-gray-200 rounded-lg shadow-sm">
        {matches.map((match) => (
          <li key={match.id} className="flex flex-col md:flex-row md:items-center justify-between px-4 py-3">
            <div className="font-medium text-gray-700">{match.name}</div>
            <div className="text-blue-600 font-bold text-lg">{match.result}</div>
            <div className="text-xs text-gray-400 md:ml-4">
              {isClient ? new Date(match.created_at).toLocaleString('vi-VN') : ''}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState(1); // Default to 'Thống Kê'
  const [stats, setStats] = useState<Stats | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from('game').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setMatches(data || []);
      setStats(calculateStats(data || []));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-2">
      <div className="max-w-3xl mx-auto rounded-lg shadow bg-white/80 border border-gray-200">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 text-center">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Bi Lắc Stats</h1>
          <p className="text-gray-500 text-sm mt-1">Quản lý & thống kê kết quả bi lắc</p>
        </div>
        {/* Tabs */}
        <div className="flex border-b border-gray-100 bg-white">
          {tabs.map((tab, idx) => (
            <button
              key={tab.label}
              className={`flex-1 py-2 text-center font-medium transition-colors duration-150 ${
                activeTab === idx
                  ? 'bg-white text-blue-600 border-b-2 border-blue-500'
                  : 'text-gray-500 hover:text-blue-600'
              }`}
              onClick={() => setActiveTab(idx)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {/* Tab Content */}
        <div className="p-4 min-h-[300px]">
          {activeTab === 0 && <AddMatchForm onMatchAdded={fetchData} />}
          {activeTab === 1 && (
            loading ? (
              <div className="flex items-center justify-center h-40 text-gray-400 text-lg font-semibold">Đang tải dữ liệu...</div>
            ) : error ? (
              <div className="flex items-center justify-center h-40 text-red-500 text-lg font-semibold">{error}</div>
            ) : stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-4">
                  <div className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    🏆 Thắng Nhiều Nhất
                  </div>
                  <ul className="text-gray-700 text-base">
                    {stats.mostWins.map((item) => (
                      <li key={item.name} className="flex justify-between py-1">
                        <span>{item.name}</span>
                        <span className="font-semibold text-blue-600">{item.value} thắng</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-4">
                  <div className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    🎯 Tỷ Lệ Thắng
                  </div>
                  <ul className="text-gray-700 text-base">
                    {stats.winRate.map((item) => (
                      <li key={item.name} className="flex justify-between py-1">
                        <span>{item.name}</span>
                        <span className="font-semibold text-purple-600">{item.value}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-4">
                  <div className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    ⚡ Tổng Điểm
                  </div>
                  <ul className="text-gray-700 text-base">
                    {stats.totalPoints.map((item) => (
                      <li key={item.name} className="flex justify-between py-1">
                        <span>{item.name}</span>
                        <span className="font-semibold text-yellow-600">{item.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-4">
                  <div className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    📊 Số Trận
                  </div>
                  <ul className="text-gray-700 text-base">
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
          {activeTab === 2 && (
            loading ? (
              <div className="flex items-center justify-center h-40 text-gray-400 text-lg font-semibold">Đang tải dữ liệu...</div>
            ) : error ? (
              <div className="flex items-center justify-center h-40 text-red-500 text-lg font-semibold">{error}</div>
            ) : (
              <MatchHistory matches={matches} />
            )
          )}
        </div>
      </div>
    </div>
  );
}