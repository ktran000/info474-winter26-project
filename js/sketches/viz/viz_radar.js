(function () {
  window.VizRadar = {
    selectedCountry: "Finland", 
    selector: null,

    draw: function (p, manager, ai, progress) {
      const data = manager.data || [];
      const w = manager.width || 800;
      const h = manager.height || 550;
      const centerX = w / 1.75;
      const centerY = h / 2 + 80;
      const maxRadius = 160;

      if (!data.length) return;
      p.background(255);

      // ---- 1. init dropdown ----
      if (!this.selector && p.select('#vis')) {
        this.selector = p.createSelect();
        this.selector.parent('vis'); 
        this.selector.style('position', 'absolute'); 

        const names = data.map(d => d.country).sort();
        names.forEach(name => this.selector.option(name));
        this.selector.selected(this.selectedCountry);
        
        this.selector.changed(() => {
            this.selectedCountry = this.selector.value();
        });
      }

      // radar chart is 6th section (Index 6)
      if (this.selector) {
        if (manager.activeIndex === 6) {
            this.selector.show();
        } else {
            this.selector.hide();
        }
      }
      
      if (this.selector) {
        if (manager.activeIndex === 7) {
          this.selector.show();
        } else {
          this.selector.hide();
        }

        if (this.selector.value() !== this.selectedCountry) {
          this.selector.selected(this.selectedCountry);
        }
      }

      // ---- 2. radar metrics & scales ----
      const metrics = [
        { key: 'gdp', label: 'Wealth', min: 6, max: 12 },
        { key: 'social_support', label: 'Social Support', min: 0.3, max: 1 },
        { key: 'freedom', label: 'Freedom', min: 0.3, max: 1 },
        { key: 'life_expectancy', label: 'Health', min: 45, max: 80 }
      ];

      // ---- 3. draw background web ----
      p.stroke(230);
      p.strokeWeight(1);
      p.noFill();
      for (let i = 1; i <= 4; i++) {
        let r = (maxRadius / 4) * i;
        this.drawRegularPolygon(p, centerX, centerY, r, metrics.length);
      }

      // craw axes/labels
      metrics.forEach((m, i) => {
        let angle = p.TWO_PI / metrics.length * i - p.HALF_PI;
        let x = centerX + p.cos(angle) * maxRadius;
        let y = centerY + p.sin(angle) * maxRadius;
        p.stroke(230);
        p.line(centerX, centerY, x, y);
        p.noStroke();
        p.fill(120);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(12);
        let lx = centerX + p.cos(angle) * (maxRadius + 45); 
        let ly = centerY + p.sin(angle) * (maxRadius + 45);
        p.text(m.label, lx, ly);
      });
      

      // ---- 4. plot selected country ----
      const d = data.find(item => item.country === this.selectedCountry);
      if (d) {
        const regionCol = VizFreedom.regionColors[d.region] || "#999";
        p.fill(p.color(regionCol + "55")); 
        p.stroke(regionCol);
        p.strokeWeight(3);
        p.beginShape();
        metrics.forEach((m, i) => {
          let angle = p.TWO_PI / metrics.length * i - p.HALF_PI;
          let val = p.norm(d[m.key], m.min, m.max);
          let r = p.constrain(val * maxRadius, 0, maxRadius);
          p.vertex(centerX + p.cos(angle) * r, centerY + p.sin(angle) * r);
        });
        p.endShape(p.CLOSE);

        metrics.forEach((m, i) => {
           let angle = p.TWO_PI / metrics.length * i - p.HALF_PI;
           let val = p.norm(d[m.key], m.min, m.max);
           let r = p.constrain(val * maxRadius, 0, maxRadius);
           p.fill(regionCol);
           p.noStroke();
           p.circle(centerX + p.cos(angle) * r, centerY + p.sin(angle) * r, 6);
        });
      }

      // ---- 5. titles ----
      p.noStroke();
      p.fill(50);
      p.textSize(22);
      p.textStyle(p.BOLD);
      p.textAlign(p.CENTER);
      p.text(`Country Profile: ${this.selectedCountry}`, centerX, 60);
      p.textSize(14);
      p.textStyle(p.NORMAL);
      p.fill(150);
      p.text("Comparing core happiness drivers", centerX, 85);
    },

    drawRegularPolygon: function(p, x, y, r, n) {
      p.beginShape();
      for (let i = 0; i < n; i++) {
        let angle = p.TWO_PI / n * i - p.HALF_PI;
        p.vertex(x + p.cos(angle) * r, y + p.sin(angle) * r);
      }
      p.endShape(p.CLOSE);
    }
  };
})();