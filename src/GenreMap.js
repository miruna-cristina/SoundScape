import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import './GenreMap.css';

function GenreMap({ data, subgenreData, transform, setTransform, onSubgenreSelect }) {
  const svgRef = useRef(null);
  const genresGroupRef = useRef(null);
  const subgenresGroupRef = useRef(null);

  // Initialize the SVG and render genres
  useEffect(() => {
    if (data.length === 0) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("background", "#1a1a2e")
      .call(
        d3
          .zoom()
          .scaleExtent([1, 8]) // Define minimum and maximum zoom levels
          .on("zoom", (event) => {
            setTransform(event.transform);
          })
      );

    const genresGroup = d3.select(genresGroupRef.current);
    genresGroup.selectAll("*").remove(); // Clear previous content

    const delaunay = d3.Delaunay.from(
      data,
      (d) => d.x,
      (d) => d.y
    );
    const voronoi = delaunay.voronoi([0, 0, width, height]);

// Create separate groups for regions and labels
const regionsGroup = genresGroup.append("g").attr("class", "regions");
const labelsGroup = genresGroup.append("g").attr("class", "labels");

// Render regions
regionsGroup
  .selectAll(".region")
  .data(data)
  .enter()
  .append("path")
  .attr("class", "region")
  .attr("d", (_, i) => voronoi.renderCell(i))
  .style("fill", (d) => d.color)
  .style("stroke", "#1a1a2e")
  .style("stroke-width", 2)
  .style("cursor", "pointer")
  .on("mouseover", function () {
    d3.select(this)
      .raise() // Bring the region to the top of the regions group
      .transition()
      .duration(200)
      .style("stroke", "#f6ccff")
      .style("stroke-width", 4);
  })
  .on("mouseout", function () {
    d3.select(this)
      .transition()
      .duration(200)
      .style("stroke", "#1a1a2e")
      .style("stroke-width", 2);
  });

// Render labels
labelsGroup
  .selectAll(".label")
  .data(data)
  .enter()
  .append("text")
  .attr("class", "label")
  .attr("x", (d) => d.x)
  .attr("y", (d) => d.y + 5)
  .attr("text-anchor", "middle")
  .style("fill", "white")
  .style("font-size", "18px")
  .style("pointer-events", "none") // Ensure labels don't interfere with mouse events
  .text((d) => d.name || "Unknown");

genresGroup
  .selectAll(".label")
  .data(data)
  .enter()
  .append("text")
  .attr("class", "label")
  .attr("x", (d) => d.x)
  .attr("y", (d) => d.y + 5)
  .attr("text-anchor", "middle")
  .style("fill", "white")
  .style("font-size", "18px")
  .style("pointer-events", "none")
  .text((d) => d.name || "Unknown");
}, [data, setTransform]);

  // Render subgenres when subgenreData is updated
  useEffect(() => {
    const subgenresGroup = d3.select(subgenresGroupRef.current);
    subgenresGroup.selectAll("*").remove();

    if (subgenreData.length === 0) return;

  // Create separate groups for decorative music notes and labels
  const musicNotesGroup = subgenresGroup.append("g").attr("class", "music-notes");
  const subgenreLabelsGroup = subgenresGroup.append("g").attr("class", "subgenre-labels");

  // Render decorative music notes
  musicNotesGroup
  .selectAll(".music-note")
  .data(subgenreData)
  .enter()
  .append("path")
  .attr("class", "music-note")
  .attr("d", "M9 3v10.55A4 4 0 1 0 11 17V7h6v6.55A4 4 0 1 0 19 17V3H9z") // Music note path
  .attr("transform", (d) => `translate(${d.x-25}, ${d.y-25}) scale(2)`) // Adjust size and position
  .attr("fill", "black") // Black color
  .attr("fill-opacity", 0.3) // Partially transparent
  .attr("stroke", "none"); // No stroke

  // Render subgenre labels
  subgenreLabelsGroup
  .selectAll(".subgenre-label")
  .data(subgenreData)
  .enter()
  .append("text")
  .attr("class", "subgenre-label")
  .attr("x", (d) => d.x)
  .attr("y", (d) => d.y) // Position above the music note
  .attr("text-anchor", "middle")
  .style("fill", "white")
  .style("font-size", "14px")
  .text((d) => d.name || "Unknown")
  .on("click", (event, d) => {
    onSubgenreSelect(d); // Handle subgenre selection on click
  })
  .on("mouseover", function () {
    d3.select(this)
      .transition()
      .duration(200)
      .style("font-size", "18px") // Increase font size on hover
      .style("text-shadow", "2px 2px 0px black, -2px 2px 0px black, 2px -2px 0px black, -2px -2px 0px black");
  })
  .on("mouseout", function () {
    d3.select(this)
      .transition()
      .duration(200)
      .style("font-size", "14px")// Reset font size on mouseout
      .style("text-shadow", "none");
  });
  }, [subgenreData, onSubgenreSelect]);

  useEffect(() => {
    const genresGroup = d3.select(genresGroupRef.current);
    genresGroup.transition().duration(500).attr("transform", transform.toString());

    const subgenresGroup = d3.select(subgenresGroupRef.current);
    subgenresGroup.transition().duration(500).attr("transform", transform.toString());
  }, [transform]);

  return (
    <svg ref={svgRef}>
      <g ref={genresGroupRef} />
      <g ref={subgenresGroupRef} className="subgenres" />
    </svg>
  );
}

export default GenreMap;
