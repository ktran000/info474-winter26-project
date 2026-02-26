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
      // Title / intro sections
      if (ai === 0 || ai === 1) {
        window.VizTitle.draw(p, manager, ai, progress);
        return;
      }

      // GDP vs Happiness (keep your current scatter)
      // Show for sections 4 and 5
      if (ai === 4 || ai === 5) {
        window.VizScatter.draw(p, manager, ai, progress);
        return;
      }

      // Life Expectancy vs Happiness (your second scatter)
      // Show for section 6
      if (ai === 6) {
        window.VizLifeScatter.draw(p, manager, ai, progress);
        return;
      }

      // Optional bar chart on the last section
      if (ai === 7) {
        window.VizBar.draw(p, manager, ai, progress);
        return;
      }

      // Default fallback: show nothing (or you can keep title)
      // window.VizTitle.draw(p, manager, ai, progress);
    }
  };
})();
