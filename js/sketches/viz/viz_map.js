(function () {
  window.VizMap = {
    world: null,
    cachedPaths: [],

    draw: function (p, manager) {
      const data = manager.data || [];
      if (!data.length) return;

      const w = manager.width || 800;
      const h = manager.height || 500;
      const offsetX = manager.offsetX || 0;
      const offsetY = manager.offsetY || 40;
      
      // reserve space for sidebar
      const sidebarW = 180;
      const mapWidth = w - sidebarW;

      p.push();
      p.background(255);

      // ---- title ----
      p.noStroke();
      p.fill(50);
      p.textSize(24);
      p.textStyle(p.BOLD);
      p.textAlign(p.CENTER);
      p.text("Global Happiness Distribution", w / 2 + offsetX, 40);

      // ---- load world map once ----
      if (!this.world) {
        d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(topology => {
          const world = topojson.feature(topology, topology.objects.countries);
          this.world = world;

          const projection = d3.geoNaturalEarth1()
            .scale(mapWidth / 6.2)
            .translate([mapWidth / 2, h / 2]);
          const geoPath = d3.geoPath().projection(projection);

          this.cachedPaths = world.features.map(f => ({
            path2D: new Path2D(geoPath(f)),
            name: f.properties.name
          }));
        });
        p.pop();
        return;
      }

      p.translate(offsetX, offsetY);

      // ---- data processing ----
      const happinessByCountry = {};
      data.forEach(d => {
        let name = d.country;
        if (name === "United States") name = "United States of America";
        if (name === "South Korea")   name = "Republic of Korea";
        happinessByCountry[name] = d.happiness;
      });

      // Get Top 10 for sidebar
      const top10 = [...data]
        .sort((a, b) => b.happiness - a.happiness)
        .slice(0, 10);

      const colorLow  = p.color('#440154');
      const colorMid  = p.color('#21908d');
      const colorHigh = p.color('#fde725');

      // ---- draw countries ----
      this.cachedPaths.forEach(item => {
        const score = happinessByCountry[item.name];
        if (score !== undefined) {
          let amt = p.norm(score, 2, 8);
          let col = amt < 0.5
            ? p.lerpColor(colorLow, colorMid, amt * 2)
            : p.lerpColor(colorMid, colorHigh, (amt - 0.5) * 2);
          p.fill(col);
        } else {
          p.fill(242);
        }
        p.stroke(255);
        p.strokeWeight(0.5);
        p.drawingContext.fill(item.path2D);
        p.drawingContext.stroke(item.path2D);
      });

      // ---- legend & sidebar ----
      this.drawLegend(p, colorLow, colorMid, colorHigh, h);
      this.drawTop10(p, top10, mapWidth + 20, 80);

      p.pop();
    },

    drawTop10: function(p, list, x, y) {
      p.textAlign(p.LEFT, p.TOP);
      p.fill(80);
      p.textStyle(p.BOLD);
      p.textSize(14);
      p.text("TOP 10 COUNTRIES", x, y);
      
      p.textStyle(p.NORMAL);
      p.textSize(12);
      list.forEach((d, i) => {
        const rowY = y + 25 + (i * 22);
        p.fill(120);
        p.text(`${i + 1}.`, x, rowY);
        p.fill(50);
        p.text(d.country, x + 20, rowY);
        p.textAlign(p.RIGHT);
        p.fill(33, 144, 141); 
        p.text(d.happiness.toFixed(2), x + 150, rowY);
        p.textAlign(p.LEFT);
      });
    },

    drawLegend: function (p, c1, c2, c3, h) {
      const lx = 30, ly = h - 40, lw = 200, lh = 12;
      for (let i = 0; i < lw; i++) {
        let inter = i / lw;
        let col = inter < 0.5 ? p.lerpColor(c1, c2, inter * 2) : p.lerpColor(c2, c3, (inter - 0.5) * 2);
        p.stroke(col);
        p.line(lx + i, ly, lx + i, ly + lh);
      }
      p.fill(100); p.noStroke(); p.textSize(11);
      p.textAlign(p.LEFT); p.text("Lower Happiness", lx, ly - 8);
      p.textAlign(p.RIGHT); p.text("Higher", lx + lw, ly - 8);
    }
  };
})();