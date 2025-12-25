import React, { useState, useMemo } from 'react';
import type { AppProps } from './types';

export interface GitHubStatsData {
  username: string;
  displayName: string;
  tagline?: string;
  avatarUrl?: string;
  profileUrl: string;
  totalCommits: number;
  repos: number;
  additions: number;
  deletions: number;
  netLoc: number;
  yearsCoding: number;
  firstCommit: string;
  monthlyCommits: Array<{ month: string; commits: number }>;
  byDayOfWeek: Array<{ day: string; commits: number }>;
  topRepos: Array<{ repo: string; commits: number }>;
  cumulativeLoc: Array<{ month: string; loc: number }>;
}

export interface GitHubStatsConfig {
  stats: GitHubStatsData;
  stackOverflow?: {
    userId: string;
    reputation?: number;
    answers?: number;
    questions?: number;
    badges?: { gold: number; silver: number; bronze: number };
  };
}

const formatNumber = (num: number): string => {
  if (!Number.isFinite(num)) return '0';
  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  if (absNum >= 1000000) return sign + (absNum / 1000000).toFixed(1) + 'M';
  if (absNum >= 1000) return sign + (absNum / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
};

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, subtext, color = 'text-purple-400' }) => (
  <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all hover:scale-[1.02]">
    <div className="flex items-center gap-3 mb-2">
      <div className={`p-2 rounded-lg bg-white/5 ${color}`}>
        {icon}
      </div>
      <span className="text-xs text-gray-400 uppercase tracking-wider">{label}</span>
    </div>
    <div className="text-2xl font-bold text-white">{value}</div>
    {subtext && <div className="text-xs text-gray-500 mt-1">{subtext}</div>}
  </div>
);

// Simple bar chart component
const SimpleBarChart: React.FC<{ data: Array<{ label: string; value: number; color?: string }> }> = ({ data }) => {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((item, i) => (
        <div key={i} className="flex-1 flex flex-col items-center">
          <div
            className="w-full rounded-t transition-all hover:opacity-80"
            style={{
              height: `${(item.value / max) * 100}%`,
              backgroundColor: item.color || COLORS[i % COLORS.length],
              minHeight: item.value > 0 ? '4px' : '0'
            }}
          />
          <span className="text-[10px] text-gray-500 mt-1 truncate w-full text-center">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

const ZGitHubStats: React.FC<AppProps & { config?: GitHubStatsConfig }> = ({ className, config }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'repos' | 'stackoverflow'>('overview');

  const stats = config?.stats;
  const so = config?.stackOverflow;

  // Memoized chart data
  const recentCommits = useMemo(() =>
    stats?.monthlyCommits.slice(-12).map(item => ({
      label: item.month.slice(5), // "2024-01" -> "01"
      value: item.commits
    })) ?? [], [stats?.monthlyCommits]
  );

  const dayOfWeekData = useMemo(() =>
    stats?.byDayOfWeek.map((item, idx) => ({
      label: item.day.slice(0, 3),
      value: item.commits,
      color: COLORS[idx % COLORS.length]
    })) ?? [], [stats?.byDayOfWeek]
  );

  const yearlySummary = useMemo(() =>
    stats ? Object.entries(
      stats.monthlyCommits.reduce((acc, item) => {
        const year = item.month.slice(0, 4);
        acc[year] = (acc[year] || 0) + item.commits;
        return acc;
      }, {} as Record<string, number>)
    ).reverse().slice(0, 8) : [], [stats]
  );

  if (!stats) {
    return (
      <div className={`flex items-center justify-center h-full bg-gray-900 ${className || ''}`}>
        <div className="text-gray-400">No stats data provided</div>
      </div>
    );
  }

  return (
    <div className={`h-full bg-transparent text-white overflow-hidden flex flex-col ${className || ''}`}>
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold border-2 border-white/20">
              {stats.avatarUrl ? (
                <img src={stats.avatarUrl} alt={stats.displayName} className="w-full h-full rounded-full object-cover" />
              ) : (
                stats.displayName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-gray-900" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{stats.displayName}</h1>
              <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">@{stats.username}</span>
              <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                🔥 {stats.yearsCoding} years
              </span>
            </div>
            {stats.tagline && <p className="text-sm text-gray-400 mt-1">{stats.tagline}</p>}
          </div>
          <a
            href={stats.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            View Profile
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 px-4 bg-white/5">
        {(['overview', 'activity', 'repos', ...(so ? ['stackoverflow'] : [])] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm capitalize transition-colors relative ${
              activeTab === tab ? 'text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>}
                label="Total Commits"
                value={formatNumber(stats.totalCommits)}
                subtext={`Since ${stats.firstCommit}`}
                color="text-purple-400"
              />
              <StatCard
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>}
                label="Net Lines of Code"
                value={formatNumber(stats.netLoc)}
                subtext={`+${formatNumber(stats.additions)} / -${formatNumber(stats.deletions)}`}
                color="text-green-400"
              />
              <StatCard
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
                label="Repositories"
                value={stats.repos}
                subtext="Public & Private"
                color="text-blue-400"
              />
              <StatCard
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                label="Years Coding"
                value={stats.yearsCoding}
                subtext={`Started ${new Date(stats.firstCommit).getFullYear()}`}
                color="text-orange-400"
              />
            </div>

            {/* Commit Activity Chart */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="font-medium">Commit Activity (Last 12 Months)</h3>
              </div>
              <SimpleBarChart data={recentCommits} />
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Day of Week Activity */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="font-medium">Commits by Day of Week</h3>
              </div>
              <SimpleBarChart data={dayOfWeekData} />
            </div>

            {/* Yearly Breakdown */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="font-medium">Yearly Summary</h3>
              </div>
              <div className="space-y-3 max-h-[250px] overflow-y-auto">
                {yearlySummary.map(([year, commits]) => (
                  <div key={year} className="flex items-center gap-3">
                    <span className="text-sm text-gray-400 w-12">{year}</span>
                    <div className="flex-1 bg-gray-700/50 rounded-full h-4 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        style={{ width: `${Math.min((commits / 6000) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-16 text-right">{formatNumber(commits)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'repos' && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <h3 className="font-medium">Top Repositories by Commits</h3>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {stats.topRepos.slice(0, 15).map((repo, idx) => (
                <a
                  key={repo.repo}
                  href={`https://github.com/${repo.repo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] + '20', color: COLORS[idx % COLORS.length] }}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate group-hover:text-purple-400 transition-colors">
                      {repo.repo.split('/')[1] || repo.repo}
                    </div>
                    <div className="text-xs text-gray-500 truncate">{repo.repo}</div>
                  </div>
                  <div className="text-sm font-medium text-gray-400">
                    {formatNumber(repo.commits)}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'stackoverflow' && so && (
          <div className="space-y-4">
            {/* SO Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#F48024] flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
                    <path d="M15 21h-10v-2h10v2zm6-11.665l-1.621-9.335-1.993.346 1.62 9.335 1.994-.346zm-5.964 6.937l-9.746-.975-.186 2.016 9.755.879.177-1.92zm.538-2.587l-9.276-2.608-.526 1.954 9.306 2.5.496-1.846zm1.204-2.413l-8.297-4.864-1.029 1.743 8.298 4.865 1.028-1.744zm1.866-1.467l-5.339-7.829-1.672 1.14 5.339 7.829 1.672-1.14zm-2.644 4.195v8h-12v-8h-2v10h16v-10h-2z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Stack Overflow</h3>
                  <p className="text-gray-400 text-sm">User #{so.userId}</p>
                </div>
              </div>
              <a
                href={`https://stackoverflow.com/users/${so.userId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#F48024] hover:bg-[#da7020] text-white text-sm font-medium rounded-lg transition-colors"
              >
                View Profile
              </a>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <StatCard
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>}
                label="Reputation"
                value={formatNumber(so.reputation || 0)}
                color="text-[#F48024]"
              />
              <StatCard
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>}
                label="Answers"
                value={formatNumber(so.answers || 0)}
                color="text-green-400"
              />
              <StatCard
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                label="Questions"
                value={formatNumber(so.questions || 0)}
                color="text-blue-400"
              />
            </div>

            {/* Badges */}
            {so.badges && (
              <div className="bg-gray-800/50 rounded-xl p-6 border border-white/10">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  Badges Earned
                </h3>
                <div className="flex justify-center gap-8">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mb-2 mx-auto text-2xl">🥇</div>
                    <div className="text-2xl font-bold text-yellow-400">{so.badges.gold}</div>
                    <div className="text-xs text-gray-400">Gold</div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-400/20 flex items-center justify-center mb-2 mx-auto text-2xl">🥈</div>
                    <div className="text-2xl font-bold text-gray-300">{so.badges.silver}</div>
                    <div className="text-xs text-gray-400">Silver</div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-orange-700/20 flex items-center justify-center mb-2 mx-auto text-2xl">🥉</div>
                    <div className="text-2xl font-bold text-orange-400">{so.badges.bronze}</div>
                    <div className="text-xs text-gray-400">Bronze</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ZGitHubStats;
