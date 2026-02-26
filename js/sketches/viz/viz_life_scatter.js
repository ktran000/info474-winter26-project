// viz_life_scatter.js
// Life Expectancy vs Happiness scatterplot using manager.data (from happiness_clean.csv)

(function () {
  window.VizLifeScatter = {
    draw: function (p, manager, ai, progress) {
      const data = manager.data || [];
      const w = manager.width || 600;
      const h = manager.height || 520;
      const offsetX = manager.offsetX || 80;
      const offsetY = manager.offsetY || 0;

      const padL = 10;
      const padR = 10;
      const padT = 45;
      const padB = 55;

      const x0 = offsetX + padL;
      const x1 = offsetX + w - padR;
      const y0 = offsetY + padT;
      const y1 = offsetY + h - padB;

      p.noStroke();

      if (!data.length) {
        p.fill(0);
        p.textSize(14);
        p.textAlign(p.LEFT, p.TOP);
        p.text("Loading data...", x0, y0);
        return;
      }

      let minLE = Infinity, maxLE = -Infinity;
      let minHappy = Infinity, maxHappy = -Infinity;

      for (const d of data) {
        if (d.life_expectancy < minLE) minLE = d.life_expectancy;
        if (d.life_expectancy > maxLE) maxLE = d.life_expectancy;
        if (d.happiness < minHappy) minHappy = d.happiness;
        if (d.happiness > maxHappy) maxHappy = d.happiness;
      }

      // ---- Title (FIXED so it won't clip) ----
      p.fill(0);
      p.noStroke();
      p.textSize(18);
      p.textAlign(p.CENTER, p.TOP);
      p.text("Life Expectancy vs Happiness", (x0 + x1) / 2, offsetY + 10);

      // ---- Axes ----
      p.stroke(0);
      p.line(x0, y1, x1, y1); // x axis
      p.line(x0, y0, x0, y1); // y axis
      p.noStroke();

      // ---- Axis labels ----
      p.fill(0);
      p.textSize(12);

      p.textAlign(p.CENTER, p.TOP);
      p.text("Life Expectancy", (x0 + x1) / 2, y1 + 18);

      p.push();
      p.translate(x0 - 45, (y0 + y1) / 2);
      p.rotate(-p.HALF_PI);
      p.textAlign(p.CENTER, p.TOP);
      p.text("Happiness Score", 0, 0);
      p.pop();

      function regionColor(region) {
        const r = (region || "").toLowerCase();
        if (r.includes("europe")) return p.color(66, 133, 244, 190);
        if (r.includes("asia")) return p.color(52, 168, 83, 190);
        if (r.includes("america")) return p.color(234, 67, 53, 190);
        if (r.includes("africa")) return p.color(251, 188, 5, 190);
        if (r.includes("oceania")) return p.color(171, 71, 188, 190);
        return p.color(140, 140, 140, 190);
      }

      let hovered = null;

      for (const d of data) {
        const x = p.map(d.life_expectancy, minLE, maxLE, x0, x1);
        const y = p.map(d.happiness, minHappy, maxHappy, y1, y0);

        const dist = p.dist(p.mouseX, p.mouseY, x, y);
        const isHover = dist < 7;

        p.noStroke();
        p.fill(isHover ? 0 : regionColor(d.region));
        p.circle(x, y, isHover ? 9 : 7);

        if (isHover) hovered = { d, x, y };
      }

      if (hovered) {
        const d = hovered.d;
        const boxW = 260;
        const boxH = 60;

        let boxX = hovered.x + 12;
        let boxY = hovered.y - (boxH + 12);

        if (boxX + boxW > x1) boxX = hovered.x - boxW - 12;
        if (boxY < y0) boxY = hovered.y + 12;

        p.noStroke();
        p.fill(0);
        p.rect(boxX, boxY, boxW, boxH, 6);

        p.fill(255);
        p.textSize(12);
        p.textAlign(p.LEFT, p.TOP);
        p.text(
          `${d.country}\nLife Exp: ${Number(d.life_expectancy).toFixed(2)}\nHappiness: ${Number(d.happiness).toFixed(2)}`,
          boxX + 10,
          boxY + 8
        );
      }
    }
  };
})();