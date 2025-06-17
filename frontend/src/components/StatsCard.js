"use client";

export default function StatsCard({ title, value, suffix, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold mt-1">
            {value}
            {suffix && (
              <span className="text-lg font-normal text-gray-600">
                {" "}
                {suffix}
              </span>
            )}
          </p>
        </div>
        {Icon && (
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="text-2xl text-white" />
          </div>
        )}
      </div>
    </div>
  );
}
