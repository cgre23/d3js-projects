/* 
  D3.js Scrollytelling Demo - JavaScript
*/

// ============================================
// DATA
// ============================================

const data = [
    { id: 0, foo: 4, bar: 1, baz: 7 },
    { id: 1, foo: 6, bar: 7, baz: 2 },
    { id: 2, foo: 9, bar: 5, baz: 9 },
    { id: 3, foo: 2, bar: 4, baz: 3 },
    { id: 4, foo: 8, bar: 2, baz: 8 },
    { id: 5, foo: 9, bar: 9, baz: 1 },
    { id: 6, foo: 5, bar: 3, baz: 5 },
    { id: 7, foo: 3, bar: 8, baz: 6 },
    { id: 8, foo: 1, bar: 6, baz: 4 }
  ];
  
  // ============================================
  // DIMENSIONS & SCALES
  // ============================================
  
  const margin = { top: 40, right: 40, bottom: 50, left: 60 };
  let width = 500 - margin.left - margin.right;
  let height = 500 - margin.top - margin.bottom;
  
  // Create scales
  let xScale = d3.scaleLinear()
    .domain([0, 10])
    .range([0, width]);
  
  let yScale = d3.scaleLinear()
    .domain([0, 10])
    .range([height, 0]);
  
  // Color scale for bonus step
  const colorScale = d3.scaleSequential(d3.interpolatePlasma)
    .domain([0, 10]);
  
  // ============================================
  // SVG SETUP
  // ============================================
  
  const svg = d3.select('#chart')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);
  
  // Add axes groups
  const xAxisGroup = svg.append('g')
    .attr('class', 'x-axis axis')
    .attr('transform', `translate(0,${height})`);
  
  const yAxisGroup = svg.append('g')
    .attr('class', 'y-axis axis');
  
  // Initial axes
  xAxisGroup.call(d3.axisBottom(xScale));
  yAxisGroup.call(d3.axisLeft(yScale));
  
  // ============================================
  // CREATE DATA POINTS
  // ============================================
  
  const circles = svg.selectAll('.data-point')
    .data(data, d => d.id)
    .join('circle')
    .attr('class', 'data-point')
    .attr('cx', d => xScale(d.foo))
    .attr('cy', d => yScale(d.bar))
    .attr('r', 10)
    .attr('fill', '#667eea')
    .attr('opacity', 0.8)
    .attr('stroke', '#5a67d8')
    .attr('stroke-width', 2);
  
  // ============================================
  // UPDATE FUNCTION
  // ============================================
  
  let currentStep = 0;
  
  function updateVisualization(stepIndex) {
    currentStep = stepIndex;
    let xAccessor, yAccessor, xLabel, yLabel, useColor = false;
    
    // Define what to show at each step
    switch(stepIndex) {
      case 0:
        xAccessor = d => d.foo;
        yAccessor = d => d.bar;
        xLabel = "Foo Values";
        yLabel = "Bar Values";
        break;
      case 1:
        xAccessor = d => d.bar;
        yAccessor = d => d.baz;
        xLabel = "Bar Values";
        yLabel = "Baz Values";
        break;
      case 2:
        xAccessor = d => d.baz;
        yAccessor = d => d.foo;
        xLabel = "Baz Values";
        yLabel = "Foo Values";
        break;
      case 3:
        xAccessor = d => d.baz;
        yAccessor = d => d.foo;
        xLabel = "Baz Values (Color Encoded)";
        yLabel = "Foo Values";
        useColor = true;
        break;
      default:
        xAccessor = d => d.foo;
        yAccessor = d => d.bar;
        xLabel = "Foo Values";
        yLabel = "Bar Values";
    }
    
    // Animate circles to new positions
    circles
      .transition()
      .duration(1000)
      .ease(d3.easeCubicInOut)
      .attr('cx', d => xScale(xAccessor(d)))
      .attr('cy', d => yScale(yAccessor(d)))
      .attr('fill', d => useColor ? colorScale(xAccessor(d)) : '#667eea')
      .attr('stroke', d => useColor ? d3.color(colorScale(xAccessor(d))).darker(0.5) : '#5a67d8');
    
    // Update axis labels
    updateAxisLabels(xLabel, yLabel);
    
    // Update ARIA live region
    updateAriaStatus(stepIndex, xLabel, yLabel);
  }
  
  // ============================================
  // AXIS LABELS
  // ============================================
  
  function updateAxisLabels(xLabel, yLabel) {
    // Remove old labels
    svg.selectAll('.axis-label').remove();
    
    // Add new x-axis label
    svg.append('text')
      .attr('class', 'axis-label')
      .attr('x', width / 2)
      .attr('y', height + 40)
      .attr('text-anchor', 'middle')
      .style('opacity', 0)
      .text(xLabel)
      .transition()
      .duration(500)
      .style('opacity', 1);
    
    // Add new y-axis label
    svg.append('text')
      .attr('class', 'axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -40)
      .attr('text-anchor', 'middle')
      .style('opacity', 0)
      .text(yLabel)
      .transition()
      .duration(500)
      .style('opacity', 1);
  }
  
  // ============================================
  // ACCESSIBILITY
  // ============================================
  
  function updateAriaStatus(stepIndex, xLabel, yLabel) {
    const status = d3.select('#status');
    const message = `Step ${stepIndex + 1}: Now showing ${xLabel} versus ${yLabel}`;
    status.text(message);
  }
  
  // ============================================
  // SCROLLAMA SETUP
  // ============================================
  
  const scroller = scrollama();
  
  scroller
    .setup({
      step: '.step',
      offset: 0.5,
      debug: false
    })
    .onStepEnter(response => {
      const stepIndex = response.index;
      
      // Update active step styling
      d3.selectAll('.step').classed('active', false);
      d3.select(response.element).classed('active', true);
      
      // Update visualization
      updateVisualization(stepIndex);
    });
  
  // ============================================
  // RESIZE HANDLING
  // ============================================
  
  function handleResize() {
    // Get new dimensions
    const container = d3.select('#chart').node();
    const containerWidth = container.offsetWidth - 40; // Account for padding
    
    // Update width
    width = Math.min(containerWidth, 500) - margin.left - margin.right;
    height = width; // Keep it square
    
    // Update scales
    xScale.range([0, width]);
    yScale.range([height, 0]);
    
    // Update SVG size
    d3.select('#chart svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);
    
    // Update axes position
    xAxisGroup
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));
    
    yAxisGroup
      .call(d3.axisLeft(yScale));
    
    // Re-render visualization without transition
    circles
      .attr('cx', d => {
        switch(currentStep) {
          case 0: return xScale(d.foo);
          case 1: return xScale(d.bar);
          case 2:
          case 3: return xScale(d.baz);
          default: return xScale(d.foo);
        }
      })
      .attr('cy', d => {
        switch(currentStep) {
          case 0: return yScale(d.bar);
          case 1: return yScale(d.baz);
          case 2:
          case 3: return yScale(d.foo);
          default: return yScale(d.bar);
        }
      });
    
    // Update axis labels
    svg.selectAll('.axis-label').remove();
    const labels = getLabelsForStep(currentStep);
    updateAxisLabels(labels.xLabel, labels.yLabel);
    
    // Refresh scrollama
    scroller.resize();
  }
  
  function getLabelsForStep(stepIndex) {
    switch(stepIndex) {
      case 0:
        return { xLabel: "Foo Values", yLabel: "Bar Values" };
      case 1:
        return { xLabel: "Bar Values", yLabel: "Baz Values" };
      case 2:
        return { xLabel: "Baz Values", yLabel: "Foo Values" };
      case 3:
        return { xLabel: "Baz Values (Color Encoded)", yLabel: "Foo Values" };
      default:
        return { xLabel: "Foo Values", yLabel: "Bar Values" };
    }
  }
  
  // Debounce resize events
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(handleResize, 250);
  });
  
  // Initial resize to fit container
  handleResize();
  
  // ============================================
  // INITIALIZE
  // ============================================
  
  // Set initial state
  updateVisualization(0);
  
  console.log('✨ D3 Scrollytelling demo loaded! Scroll to see the magic.');