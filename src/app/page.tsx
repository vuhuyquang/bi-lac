'use client'

import { useState, useEffect } from 'react';

const tabs = [
  { label: 'Nhập Kết Quả', icon: '✏️' },
  { label: 'Thống Kê', icon: '📊' },
  { label: 'Lịch Sử', icon: '📝' },
  { label: 'Dữ Liệu', icon: '💾' },
];

type StatsItem = { name: string; value: number };
type Stats = {
  mostWins: StatsItem[];
  winRate: StatsItem[];
  totalPoints: StatsItem[];
  totalMatches: StatsItem[];
};

type Match = {
  id?: string;
  name: string;
  result: string;
  created_at?: string;
};

// Mock data và functions thay thế Supabase
const mockMatches: Match[] = [
  { id: '1', name: 'Thành, Hải - Cương, Sơn', result: '100 - 80', created_at: '2024-01-15' },
  { id: '2', name: 'Thành, Sơn - Hải, Cương', result: '90 - 95', created_at: '2024-01-16' },
  { id: '3', name: 'Hải, Cương - Thành, Sơn', result: '110 - 85', created_at: '2024-01-17' },
  { id: '4', name: 'Cương, Thành - Hải, Sơn', result: '75 - 100', created_at: '2024-01-18' },
  { id: '5', name: 'Sơn, Hải - Thành, Cương', result: '120 - 90', created_at: '2024-01-19' },
];

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

  const handleSubmit = () => {
    const parsed = parseMatchInput(input);
    if (!parsed) {
      setMessage('Sai định dạng! Đúng: Thành, Hải - Cương, Sơn: 100 - 0');
      return;
    }
    setLoading(true);
    setMessage(null);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setMessage('Lưu thành công!');
      setInput('');
      onMatchAdded();
    }, 1000);
  };

  return (
    <div className="relative">
      {/* Decorative elements */}
      <div className="absolute -top-4 -left-4 w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full opacity-20 animate-pulse delay-500"></div>
      
      <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10 max-w-2xl mx-auto mt-8 border border-white/30 overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <span className="text-2xl text-white">🎱</span>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Nhập Kết Quả Trận Đấu
            </h2>
            <p className="text-gray-600">Ghi lại kết quả để theo dõi thống kê</p>
          </div>

          <div className="space-y-6">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="w-full border-0 rounded-2xl px-6 py-4 text-lg font-medium text-gray-800 placeholder-gray-400 bg-white/80 backdrop-blur-sm shadow-lg focus:shadow-xl focus:ring-4 focus:ring-indigo-500/30 outline-none transition-all duration-300 transform hover:scale-[1.02]"
                placeholder="Thành, Hải - Cương, Sơn: 100 - 0"
                required
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 -z-10 blur-xl opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-300 relative overflow-hidden group"
              disabled={loading}
            >
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <span className="relative z-10">
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Đang lưu...
                  </div>
                ) : (
                  '🚀 Lưu Kết Quả'
                )}
              </span>
            </button>

            {message && (
              <div className={`text-center p-4 rounded-2xl font-medium transform animate-bounce ${
                message.includes('thành công') 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}>
                <span className="inline-block mr-2">
                  {message.includes('thành công') ? '✅' : '❌'}
                </span>
                {message}
              </div>
            )}

            <div className="bg-gray-50/80 rounded-2xl p-4 text-center">
              <p className="text-gray-600 text-sm">
                <span className="font-semibold text-indigo-600">Định dạng:</span>
                <br />
                <code className="bg-white/80 px-3 py-1 rounded-lg text-indigo-700 font-mono text-base mt-2 inline-block">
                  Thành, Hải - Cương, Sơn: 100 - 0
                </code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ title, icon, items, colorClass, delay = 0 }: {
  title: string;
  icon: string;
  items: StatsItem[];
  colorClass: string;
  delay?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`transform transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
      <div className="group relative">
        <div className={`absolute inset-0 bg-gradient-to-r ${colorClass} rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300`}></div>
        <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30 hover:shadow-3xl transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-12 h-12 bg-gradient-to-r ${colorClass} rounded-2xl flex items-center justify-center text-2xl shadow-lg transform rotate-3 group-hover:rotate-0 transition-transform duration-300`}>
              {icon}
            </div>
            <h3 className={`text-xl font-bold bg-gradient-to-r ${colorClass.replace('from-', 'from-').replace('to-', 'to-')} bg-clip-text text-transparent`}>
              {title}
            </h3>
          </div>
          
          <div className="space-y-3">
            {items.map((item, index) => (
              <div 
                key={item.name} 
                className="flex justify-between items-center py-3 px-4 rounded-2xl bg-white/50 hover:bg-white/70 transition-all duration-300 transform hover:scale-105"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className="font-medium text-gray-800 flex items-center gap-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                  {item.name}
                </span>
                <span className={`font-bold text-lg bg-gradient-to-r ${colorClass} bg-clip-text text-transparent`}>
                  {title === 'Tỷ Lệ Thắng' ? `${item.value}%` : 
                   title === 'Số Trận' ? `${item.value} trận` :
                   title === 'Thắng Nhiều Nhất' ? `${item.value} thắng` :
                   item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState(1);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      setTimeout(() => {
        setStats(calculateStats(mockMatches));
        setLoading(false);
      }, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute bottom-1/4 left-1/2 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl mb-6 shadow-2xl transform hover:scale-110 transition-transform duration-300">
              <span className="text-4xl font-bold text-white drop-shadow-lg">8</span>
            </div>
            <h1 className="text-6xl font-extrabold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-4 drop-shadow-lg">
              Thống Kê Bi Lắc
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Hệ thống quản lý và thống kê kết quả trận đấu chuyên nghiệp
            </p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {tabs.map((tab, idx) => (
              <button
                key={tab.label}
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                  activeTab === idx
                    ? 'bg-white text-indigo-700 shadow-2xl scale-105'
                    : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                }`}
                onClick={() => setActiveTab(idx)}
              >
                <span className="text-xl">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="p-8 min-h-[500px]">
              {activeTab === 0 && (
                <AddMatchForm onMatchAdded={fetchStats} />
              )}
              
              {activeTab === 1 && (
                <>
                  {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-white">
                      <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
                      <p className="text-xl font-semibold">Đang tải dữ liệu...</p>
                    </div>
                  ) : error ? (
                    <div className="flex items-center justify-center h-64 text-red-400 text-xl font-semibold">
                      ❌ {error}
                    </div>
                  ) : stats && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8">
                      <StatsCard
                        title="Thắng Nhiều Nhất"
                        icon="🏆"
                        items={stats.mostWins}
                        colorClass="from-yellow-400 to-orange-500"
                        delay={0}
                      />
                      <StatsCard
                        title="Tỷ Lệ Thắng"
                        icon="🎯"
                        items={stats.winRate}
                        colorClass="from-green-400 to-blue-500"
                        delay={200}
                      />
                      <StatsCard
                        title="Tổng Điểm"
                        icon="⚡"
                        items={stats.totalPoints}
                        colorClass="from-purple-400 to-pink-500"
                        delay={400}
                      />
                      <StatsCard
                        title="Số Trận"
                        icon="📊"
                        items={stats.totalMatches}
                        colorClass="from-indigo-400 to-cyan-500"
                        delay={600}
                      />
                    </div>
                  )}
                </>
              )}
              
              {activeTab !== 0 && activeTab !== 1 && (
                <div className="flex flex-col items-center justify-center h-64 text-white/80">
                  <div className="text-6xl mb-4">🚧</div>
                  <p className="text-2xl font-semibold mb-2">Chức năng đang phát triển</p>
                  <p className="text-lg">Sẽ sớm có trong phiên bản tiếp theo!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}