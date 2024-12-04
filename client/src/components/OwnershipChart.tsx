import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface OwnershipChartProps {
  shareholders?: any[];
  simulatedRounds?: any[];
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

export default function OwnershipChart({ shareholders, simulatedRounds }: OwnershipChartProps) {
  if (!shareholders) return null;

  const totalShares = shareholders.reduce((acc, s) => acc + s.sharesOwned, 0);
  
  const data = shareholders.map((shareholder) => ({
    name: shareholder.name,
    value: (shareholder.sharesOwned / totalShares) * 100,
  }));

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
            outerRadius={140}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
