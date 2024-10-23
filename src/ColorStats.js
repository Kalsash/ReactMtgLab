import React, { useEffect } from 'react';
import * as d3 from 'd3';

const ColorStats = ({ data }) => {
  useEffect(() => {
    const width = 200;
    const height = 200;
    const radius = Math.min(width, height) / 2;

    // Определите соответствие цвета и его названия
    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.color))
      .range([
        '#808080',  // Gray
        '#FAEBD7',  // White
        '#0000FF',  // Blue
        '#228B22',  // Green
        '#B22222',  // Red
        '#000000'   // Black
      ]);

    const pie = d3.pie()
      .value(d => d.count)
      .sort(null);

    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(radius);

    // Очистка предыдущего содержимого перед рендерингом
    d3.select("#colorStatsContainer").selectAll("*").remove();

    // Создание заголовка
    const label = d3.select("#colorStatsContainer")
      .append("label")
      .attr("class", "colorLabel")
      .text("Deck Mana Color Distribution");

    // Создание SVG элемента
    const svg = d3.select("#colorStatsContainer")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const arcs = svg.selectAll("arc")
      .data(pie(data))
      .enter()
      .append("g")
      .attr("class", "arc");

    arcs.append("path")
      .attr("d", arc)
      .attr("fill", d => color(d.data.color));
  }, [data]);

  return <div id="colorStatsContainer"></div>;
};

export default ColorStats;