import { useAdmin } from '../../context/AdminContext';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

const StatCard = ({ title, value, growth, prefix = '$' }) => {
  const { t } = useTranslation();
  const isPositive = growth >= 0;
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <div className="mt-2 flex items-baseline">
        <span className="text-3xl font-semibold text-gray-900">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
        </span>
      </div>
      <div className="mt-2 flex items-center">
        {isPositive ? (
          <ArrowUpIcon className="w-4 h-4 text-green-500" />
        ) : (
          <ArrowDownIcon className="w-4 h-4 text-red-500" />
        )}
        <span className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {Math.abs(growth).toFixed(1)}%
        </span>
        <span className="text-gray-500 text-sm ml-2">{t('admin.stats.vsLastMonth')}</span>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 shadow-lg rounded-lg border">
        <p className="font-medium">{label}</p>
        <p className="text-blue-600">
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const { t } = useTranslation();
  const { salesData, getStatistics } = useAdmin();
  const stats = getStatistics();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">{t('admin.dashboard')}</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title={t('admin.stats.totalSales')}
          value={stats.totalSales}
          growth={stats.salesGrowth}
        />
        <StatCard
          title={t('admin.stats.orders')}
          value={stats.totalOrders}
          growth={stats.ordersGrowth}
          prefix=""
        />
        <StatCard
          title={t('admin.stats.averageOrderValue')}
          value={Math.round(stats.averageOrderValue)}
          growth={stats.salesGrowth}
        />
        <StatCard
          title={t('admin.stats.activeProducts')}
          value={stats.topCategories.length}
          growth={10}
          prefix=""
        />
      </div>

      {/* Sales Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">{t('admin.stats.monthlySales')}</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">{t('admin.stats.categoryDistribution')}</h2>
        <div className="space-y-4">
          {stats.topCategories.map(category => (
            <div key={category.name}>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>{category.name}</span>
                <span>{category.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${category.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
