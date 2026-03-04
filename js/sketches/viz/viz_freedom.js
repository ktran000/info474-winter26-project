(function () {
  window.VizFreedom = {
    // defining region colors based on your CSV regions
    regionColors: {
      "Western Europe": "#4e79a7",
      "North America and ANZ": "#f28e2c",
      "Middle East and North Africa": "#e15759",
      "Latin America and Caribbean": "#76b7b2",
      "Central and Eastern Europe": "#59a14f",
      "East Asia": "#edc949",
      "Southeast Asia": "#af7aa1",
      "Commonwealth of Independent States": "#ff9da7",
      "Sub-Saharan Africa": "#9c755f",
      "South Asia": "#bab0ab"
    },

    draw: function (p, manager, ai, progress) {
      const data = manager.data || [];
      const w = manager.width || 800;
      const h = manager.height || 500;
      const offsetX = manager.offsetX || 0;
      const offsetY = manager.offsetY || 0;

      const pad = { L: 60, R: 40, T: 60, B: 60 };
      const x0 = offsetX + pad.L, x1 = offsetX + w - pad.R;
      const y0 = offsetY + pad.T, y1 = offsetY + h - pad.B;

      if (!data.length) return;

      // ---- 1. data processing ----
      let minF = 0.3, maxF = 1.0; 
      let minH = 2.0, maxH = 8.0;

      // linear regression variables
      let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
      const n = data.length;

      data.forEach(d => {
        sumX += d.freedom;
        sumY += d.happiness;
        sumXY += d.freedom * d.happiness;
        sumX2 += d.freedom * d.freedom;
      });

      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;

      // ---- 2. background & axes ----
      p.background(255);
      
      // grid lines
      p.stroke(240);
      for(let i = 0; i <= 5; i++) {
        let y = p.map(minH + i * 1.2, minH, maxH, y1, y0);
        p.line(x0, y, x1, y);
      }

      p.stroke(0);
      p.strokeWeight(1);
      p.line(x0, y1, x1, y1); // x-axis
      p.line(x0, y0, x0, y1); // y-axis

      // labels
      p.noStroke();
      p.fill(100);
      p.textAlign(p.CENTER);
      p.text("Freedom to make life choices", (x0 + x1) / 2, y1 + 40);
      p.push();
      p.translate(x0 - 45, (y0 + y1) / 2);
      p.rotate(-p.HALF_PI);
      p.text("Happiness Score", 0, 0);
      p.pop();

      // ---- 3. trendline ----
      const tx1 = minF, ty1 = slope * minF + intercept;
      const tx2 = maxF, ty2 = slope * maxF + intercept;
      p.stroke(200, 100, 100, 150);
      p.strokeWeight(2);
      p.line(
        p.map(tx1, minF, maxF, x0, x1),
        p.map(ty1, minH, maxH, y1, y0),
        p.map(tx2, minF, maxF, x0, x1),
        p.map(ty2, minH, maxH, y1, y0)
      );

      // ---- 4. plot points ----
      let hovered = null;
      for (const d of data) {
        const x = p.map(d.freedom, minF, maxF, x0, x1);
        const y = p.map(d.happiness, minH, maxH, y1, y0);

        const isHover = p.dist(p.mouseX, p.mouseY, x, y) < 8;
        const col = this.regionColors[d.region] || "#999";

        p.noStroke();
        p.fill(col + (isHover ? "FF" : "AA")); // add transparency unless hovered
        p.circle(x, y, isHover ? 12 : 8);

        if (isHover) hovered = { d, x, y };
      }

      // ---- 5. better tooltip ----
      if (hovered) {
        const { d, x, y } = hovered;
        const boxW = 160, boxH = 65;
        let tx = x + 10;
        let ty = y - boxH - 10;

        // flip tooltip if near edges
        if (tx + boxW > offsetX + w) tx = x - boxW - 10;
        if (ty < offsetY) ty = y + 10;

        p.fill(0, 220);
        p.rect(tx, ty, boxW, boxH, 8);
        p.fill(255);
        p.textAlign(p.LEFT, p.TOP);
        p.textSize(12);
        p.textStyle(p.BOLD);
        p.text(d.country, tx + 10, ty + 10);
        p.textStyle(p.NORMAL);
        p.text(`Freedom: ${d.freedom.toFixed(2)}`, tx + 10, ty + 28);
        p.text(`Happiness: ${d.happiness.toFixed(2)}`, tx + 10, ty + 42);
      }
    }
  };
})();
