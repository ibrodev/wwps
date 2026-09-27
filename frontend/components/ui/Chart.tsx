"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    BarShapeProps,
    Rectangle,
    TooltipContentProps,
} from "recharts";

interface ChartData {
    name: string;
    value: number;
}

interface HSLData {
    hue: number,
    sat: number,
    lig: number,
}

interface ChartProps {
    data: ChartData[];
    title: string,
    unit: string,
    hslColor?: HSLData
}



function getColor(
    value: number,
    min: number,
    max: number,
    hue: number = 131,
    saturation: number = 22,
    lightness: number = 29
): string {

    if (max === min) {
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }

    const normalized = (value - min) / (max - min);

    // 75% = lightest
    // 30% = darkest
    lightness = 75 - normalized * 45;

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}


export default function Chart({ data, title, hslColor, unit }: ChartProps) {
    const barWidth = 40;
    const chartWidth = Math.max(data.length * barWidth, 400);

    const values = data.map(item => item.value);

    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    const customRectangle = (props: BarShapeProps) => {

        const value = Number(props.value);

        return (
            <Rectangle
                {...props}
                fill={getColor(
                    value,
                    minValue,
                    maxValue,
                    hslColor?.hue,
                    hslColor?.sat,
                    hslColor?.lig
                )}
                stroke="none"
            />
        );
    };

    const customTooltip = ({ active, payload, label }: TooltipContentProps) => {
        if (!active || !payload || payload.length === 0) {
        return null;
    }

    const item = payload[0];

    return (
        <div className="rounded border border-gray-200 bg-white px-3 py-2 shadow-lg">
            <p className="mb-1 text-xs font-medium text-gray-600">
                {item.payload.name}
            </p>

            <p className="text-sm font-semibold text-gray-900">
                {Number(item.value).toFixed(2)} {unit}
            </p>
        </div>
    );
    }

    return (
        <div className="bg-white rounded overflow-hidden p-2">
            <p className="text-sm font-semibold mb-4">
                {title}
            </p>

            <div className="w-full overflow-x-auto">
                <div
                    style={{
                        width: `${chartWidth}px`,
                        height: "200px",
                    }}
                >
                    <BarChart
                        width={chartWidth}
                        height={200}
                        data={data}
                        margin={{
                            top: 5,
                            right: 20,
                            left: 0,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                        />

                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                            interval={0}
                        />

                        <YAxis
                            tick={{ fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                            width={30}
                        />

                        <Tooltip  content={customTooltip}/>

                        <Bar
                            dataKey="value"
                            shape={customRectangle}
                            radius={[5,5,0,0]}
                        />
                    </BarChart>
                </div>
            </div>
        </div>
    );
}