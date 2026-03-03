// viz_region_bar.js
// Average Happiness by Region (interactive: hover tooltip + click to select region)

(function () {
  window.VizRegionBar = {
    draw: function (p, manager, ai, progress) {
      const data = manager.data || [];
      const w = manager.width || 600;
      const h = manager.height || 520;
      const offsetX = manager.offsetX || 80;
      const offsetY = manager.offsetY || 0;

      // Layout
      const padL = 140; // room for region labels
      const padR = 40;
      const padT = 55;
      const padB = 55;

      const x0 = offsetX + padL;
      const x1 = offsetX + w - padR;
      const y0 = offsetY + padT;
      const y1 = offsetY + h - padB;

      // persistent selection stored on manager so it survives redraws
      if (manager.selectedRegion === undefined) manager.selectedRegion = null;

      p.noStroke();

      if (!data.length) {
        p.fill(0);
        p.textSize(14);
        p.textAlign(p.LEFT, p.TOP);
        p.text("Loading data...", x0, y0);
        return;
      }

      // --- Region colors (consistent with your other charts) ---
      function regionColor(region) {
        const r = (region || "").toLowerCase();
        if (r.includes("western europe") || r.includes("central and eastern europe")) return p.color(66, 133, 244, 210);
        if (r.includes("north america")) return p.color(234, 67, 53, 210);
        if (r.includes("latin america")) return p.color(171, 71, 188, 210);
        if (r.includes("east asia") || r.includes("southeast asia") || r.includes("south asia")) return p.color(52, 168, 83, 210);
        if (r.includes("middle east") || r.includes("north africa")) return p.color(251, 188, 5, 210);
        if (r.includes("sub-saharan africa")) return p.color(140, 140, 140, 210);
        if (r.includes("anz")) return p.color(0, 172, 193, 210); // Australia/NZ
        if (r.includes("cisd") || r.includes("commonwealth")) return p.color(255, 152, 0, 210);
        return p.color(120, 120, 120, 210);
      }

      // --- Aggregate: average happiness per region ---
      const byRegion = new Map(); // region -> {sum, count}
      for (const d of data) {
        const region = (d.region || "").trim();
        const happy = +d.happiness;
        if (!region || !Number.isFinite(happy)) continue;

        if (!byRegion.has(region)) byRegion.set(region, { sum: 0, count: 0 });
        const agg = byRegion.get(region);
        agg.sum += happy;
        agg.count += 1;
      }

      const rows = Array.from(byRegion.entries()).map(([region, agg]) => ({
        region,
        avg: agg.sum / agg.count,
        count: agg.count
      }));

      // sort high -> low
      rows.sort((a, b) => b.avg - a.avg);

      const maxAvg = Math.max(...rows.map(r => r.avg));

      // ---- Title ----
      p.fill(0);
      p.textSize(18);
      p.textAlign(p.CENTER, p.TOP);
      p.text("Average Happiness by Region", (x0 + x1) / 2, offsetY + 10);

      // ---- Axis line + label ----
      p.stroke(0);
      p.line(x0, y1, x1, y1);
      p.noStroke();

      p.fill(0);
      p.textSize(12);
      p.textAlign(p.CENTER, p.TOP);
      p.text("Average Happiness Score", (x0 + x1) / 2, y1 + 18);

      // ---- Bars ----
      const n = rows.length;
      const rowH = (y1 - y0) / n;
      const barH = rowH * 0.65;

      let hovered = null;

      // click handling: detect rising edge (mouse pressed this frame)
      const clickedThisFrame = p.mouseIsPressed && !manager._prevMousePressed;
      manager._prevMousePressed = p.mouseIsPressed;

      for (let i = 0; i < n; i++) {
        const r = rows[i];

        const yCenter = y0 + rowH * (i + 0.5);
        const barY = yCenter - barH / 2;

        const barW = p.map(r.avg, 0, maxAvg, 0, (x1 - x0));
        const barX = x0;

        const isHover =
          p.mouseX >= barX &&
          p.mouseX <= barX + barW &&
          p.mouseY >= barY &&
          p.mouseY <= barY + barH;

        // click-to-select toggle
        if (isHover && clickedThisFrame) {
          manager.selectedRegion = (manager.selectedRegion === r.region) ? null : r.region;
        }

        const isSelected = manager.selectedRegion && manager.selectedRegion === r.region;
        const dimOthers = manager.selectedRegion && !isSelected;

        // left labels
        p.fill(0);
        p.textSize(12);
        p.textAlign(p.RIGHT, p.CENTER);
        p.text(r.region, x0 - 10, yCenter);

        // bar color + dim behavior
        const baseCol = regionColor(r.region);
        const col = dimOthers ? p.color(p.red(baseCol), p.green(baseCol), p.blue(baseCol), 60) : baseCol;

        p.noStroke();
        p.fill(isHover || isSelected ? 0 : col);
        p.rect(barX, barY, barW, barH, 6);

        // value label
        p.fill(0);
        p.textAlign(p.LEFT, p.CENTER);
        p.text(r.avg.toFixed(2), barX + barW + 8, yCenter);

        if (isHover) hovered = { r, x: barX + barW, y: yCenter };
      }

      // ---- Tooltip ----
      if (hovered) {
        const r = hovered.r;
        const lines = [
          r.region,
          `Avg happiness: ${r.avg.toFixed(2)}`,
          `Countries: ${r.count}`,
          manager.selectedRegion === r.region ? "Click to clear selection" : "Click to select region"
        ];

        const boxW = 260;
        const boxH = 18 * lines.length + 14;

        let boxX = hovered.x + 18;
        let boxY = hovered.y - boxH / 2;

        if (boxX + boxW > x1) boxX = hovered.x - boxW - 18;
        if (boxY < y0) boxY = y0;
        if (boxY + boxH > y1) boxY = y1 - boxH;

        p.noStroke();
        p.fill(0);
        p.rect(boxX, boxY, boxW, boxH, 8);

        p.fill(255);
        p.textSize(12);
        p.textAlign(p.LEFT, p.TOP);

        let ty = boxY + 8;
        for (const line of lines) {
          p.text(line, boxX + 10, ty);
          ty += 18;
        }
      }
    }
  };
})();