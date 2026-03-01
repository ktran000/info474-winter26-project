// sketch_renderer.js
(function () {
  window.Renderer = {
    setData: function (manager) {
      manager.offsetX = (manager.margin && manager.margin.left) || 20;
      manager.offsetY = (manager.margin && manager.margin.top) || 0;

      return new Promise(function (resolve, reject) {
        d3.csv("data/happiness_clean.csv")
          .then(function (data) {
            data.forEach(function (d) {
              d.gdp = +d.gdp;
              d.happiness = +d.happiness;
              d.life_expectancy = +d.life_expectancy;
              d.freedom = +d.freedom;
              d.social_support = +d.social_support;
            });

            manager.data = data;
            resolve(manager.data);
          })
          .catch(function (err) {
            console.error("Error loading CSV:", err);
            reject(err);
          });
      });
    },

    draw: function (p, manager, ai, progress) {

  // 0–1: Intro / Title
  if (ai === 0 || ai === 1) {
    window.VizTitle.draw(p, manager, ai, progress);
    return;
  }

  // 2: GDP vs Happiness
  if (ai === 2) {
    window.VizScatter.draw(p, manager, ai, progress);
    return;
  }

  // 4: Freedom vs Happiness
  if (ai === 4) {
    window.VizFreedom.draw(p, manager, ai, progress);
    return;
  }

  // 5: Life Expectancy vs Happiness
  if (ai === 5) {
    window.VizLifeScatter.draw(p, manager, ai, progress);
    return;
  }

  // 6: World Map (when you build it)
  if (ai === 6) {
    window.VizMap.draw(p, manager, ai, progress);
    return;
  }

  // 7: Conclusion (optional visual)
  if (ai === 7) {
    window.VizBar.draw(p, manager, ai, progress);
    return;
  }
}
  };
})();
