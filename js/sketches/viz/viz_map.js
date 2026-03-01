// viz_map.js
(function () {
  window.VizMap = {
    world: null,
    cachedPaths: [], 

    draw: function (p, manager, ai, progress) {
      const data = manager.data || [];
      if (!data.length) return;

      const w = manager.width || 800;
      const h = manager.height || 500;
      const offsetX = manager.offsetX || 0;
      const offsetY = manager.offsetY || 40;

      p.push();
      p.translate(offsetX, offsetY);
      p.background(255); 

      // ---- 1. load world map once ----
      if (!this.world) {
        d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(topology => {
          const world = topojson.feature(topology, topology.objects.countries);
          this.world = world;

          const projection = d3.geoNaturalEarth1()
            .scale(w / 6.2)
            .translate([w / 2, h / 2]);
          const geoPath = d3.geoPath().projection(projection);

          this.cachedPaths = world.features.map(f => ({
            feature: f,
            path2D: new Path2D(geoPath(f)),
            name: f.properties.name 
          }));
        });
        p.pop();
        return;
      }

      // ---- 2. happiness lookup ----
      const happinessByCountry = {};
      data.forEach(d => {
        // normalizing common naming mismatches
        let name = d.country;
        if (name === "United States") name = "United States of America";
        if (name === "South Korea") name = "Republic of Korea";
        
        happinessByCountry[name] = d.happiness;
      });

      // ---- 3. colors & theme ----
      const colorLow = p.color('#440154');  // deep purple
      const colorMid = p.color('#21908d');  // teal
      const colorHigh = p.color('#fde725'); // happiness yellow
      let hoveredCountry = null;

      // ---- 4. draw countries ----
      this.cachedPaths.forEach(item => {
        const score = happinessByCountry[item.name];
        
        // check for hover
        const isHovered = p.drawingContext.isPointInPath(
          item.path2D, 
          p.mouseX - offsetX, 
          p.mouseY - offsetY
        );

        if (score !== undefined) {
          let amt = p.norm(score, 2, 8); // normalize 2-8 scale to 0-1
          let col = amt < 0.5 
            ? p.lerpColor(colorLow, colorMid, amt * 2) 
            : p.lerpColor(colorMid, colorHigh, (amt - 0.5) * 2);
          
          p.fill(col);
        } else {
          p.fill(240); // soft gray for missing data
        }

        p.stroke(isHovered ? 0 : 255);
        p.strokeWeight(isHovered ? 1.5 : 0.5);
        
        p.drawingContext.fill(item.path2D);
        p.drawingContext.stroke(item.path2D);

        if (isHovered) hoveredCountry = { name: item.name, val: score };
      });

      // ---- 5. tooltip ----
      if (hoveredCountry) {
        p.fill(0);
        p.noStroke();
        p.textAlign(p.LEFT);
        p.textSize(14);
        const txt = `${hoveredCountry.name}: ${hoveredCountry.val ? hoveredCountry.val.toFixed(2) : 'No Data'}`;
        p.text(txt, p.mouseX - offsetX + 10, p.mouseY - offsetY - 10);
      }

      // ---- 6. better legend ----
      this.drawLegend(p, colorLow, colorMid, colorHigh, h);

      p.pop();
    },

    drawLegend: function(p, c1, c2, c3, h) {
      const lx = 20, ly = h - 30, lw = 200, lh = 10;
      for (let i = 0; i < lw; i++) {
        let inter = i / lw;
        let col = inter < 0.5 
          ? p.lerpColor(c1, c2, inter * 2) 
          : p.lerpColor(c2, c3, (inter - 0.5) * 2);
        p.stroke(col);
        p.line(lx + i, ly, lx + i, ly + lh);
      }
      p.fill(100);
      p.noStroke();
      p.textSize(10);
      p.textAlign(p.LEFT);
      p.text("Low Happiness", lx, ly - 5);
      p.textAlign(p.RIGHT);
      p.text("High", lx + lw, ly - 5);
    }
  };
})();
