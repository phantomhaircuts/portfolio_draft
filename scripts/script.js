let weatherData;
let sprites;
let scene = document.getElementsByClassName('scene');
let weatherAssets = {
    seasonSprites : {
        spring: '../assets/spring.png',
    },
    weatherGradients : {
        coldest: 'to top, #cfd9df 0%, #e2ebf0 100%',
        colder: 'to top, #fdcbf1 0%, #fdcbf1 1%, #e6dee9 100%',
        cold: 'to top, #9890e3 0%, #b1f4cf 100%',
        cool: '120deg, #e0c3fc 0%, #8ec5fc 100%',
        temperate: 'to top, #fbc2eb 0%, #a6c1ee 100%',
        warm: 'to top, #a8edea 0%, #fed6e3 100%',
        hot: 'to top, #d299c2 0%, #fef9d7 100%)',
        hotter: 'to top, #ff9a9e 0%, #fecfef 99%, #fecfef 100%',
        hottest: 'to right, #ff8177 0%, #ff867a 0%, #ff8c7f 21%, #f99185 52%, #cf556c 78%, #b12a5b 100%'
    }
}

function getWeather( cityID ) {
    const key = '12a9bdad894e3def9bfec8acd0b748c2';
    fetch('https://api.openweathermap.org/data/2.5/weather?id=' + cityID + '&units=imperial&appid=' + key)  
    .then(function(resp) { return resp.json() }) // Convert data to json
    .then(function(data) {
      weatherData = data;
      leaves()
      if(weatherData.weather[0].main == 'rain' || weatherData.weather[0].main == 'Rain') {
          percipitation()
      }
      return weatherData;
    })
    .then(weatherLoad)
    .catch(err => console.log(err));
  }

  window.onload = function() {
    getWeather( 5128581 );
 
    function getSeason() {
        let date = new Date();
        let month = date.getMonth() + 1;
        if (month >= 3 && month <= 5) {
            return 'spring';
        }
        if (month >= 6 && month <= 8) {
            return 'summer';
        }
        if (month >= 9 && month <= 11) {
            return 'fall';
        } else {
            return 'winter';
        }
    }

    weatherAssets.season = getSeason();
  }

  function weatherLoad(){
    let scene = document.getElementById('scene');
    if(weatherData.main.temp > 20) {
        scene.style.backgroundImage = `linear-gradient(${weatherAssets.weatherGradients.coldest})`;
    } 
    if(weatherData.main.temp > 30) {
        scene.style.backgroundImage = `linear-gradient(${weatherAssets.weatherGradients.colder})`;
    } 
    if(weatherData.main.temp > 40) {
        scene.style.backgroundImage = `linear-gradient(${weatherAssets.weatherGradients.cold})`;
    } 
    if(weatherData.main.temp > 50) {
        scene.style.backgroundImage = `linear-gradient(${weatherAssets.weatherGradients.cool})`;
    } 
    if(weatherData.main.temp > 60) {
        scene.style.backgroundImage = `linear-gradient(${weatherAssets.weatherGradients.temperate})`;
    } 
    if(weatherData.main.temp > 70) {
        scene.style.backgroundImage = `linear-gradient(${weatherAssets.weatherGradients.warm})`;
    } 
    if(weatherData.main.temp > 80) {
        scene.style.backgroundImage = `linear-gradient(${weatherAssets.weatherGradients.hot})`;
    } 
    if(weatherData.main.temp > 90) {
        scene.style.backgroundImage = `linear-gradient(${weatherAssets.weatherGradients.hotter})`;
    } 
    if(weatherData.main.temp > 110) {
        scene.style.backgroundImage = `linear-gradient(${weatherAssets.weatherGradients.hottest})`;
    }
  }

function leaves() {
    let LeafScene = function(el) {
        this.viewport = el;
        this.world = document.createElement('div');
        this.leaves = [];
        this.options = {
          numLeaves: 60,
          wind: {
            magnitude: 1.2,
            //Wind speed and duration determined by current condition
            maxSpeed: weatherData.wind.speed,
            duration: weatherData.wind.deg,
            start: 0,
            speed: 0
          },
        };
    
        this.width = this.viewport.offsetWidth;
        this.height = this.viewport.offsetHeight;
        this.timer = 0;
        this._resetLeaf = function(leaf) {
          leaf.x = this.width * 2 - Math.random()*this.width*1.75;
          leaf.y = -10;
          leaf.z = Math.random()*200;
          if (leaf.x > this.width) {
            leaf.x = this.width + 10;
            leaf.y = Math.random()*this.height/2;
          }
          if (this.timer == 0) {
            leaf.y = Math.random()*this.height;
          }
          leaf.rotation.speed = Math.random()*10;
          let randomAxis = Math.random();
          if (randomAxis > 0.5) {
            leaf.rotation.axis = 'X';
          } else if (randomAxis > 0.25) {
            leaf.rotation.axis = 'Y';
            leaf.rotation.x = Math.random()*180 + 90;
          } else {
            leaf.rotation.axis = 'Z';
            leaf.rotation.x = Math.random()*360 - 180;
            leaf.rotation.speed = Math.random()*3;
          }
          leaf.xSpeedVariation = Math.random() * 1.8 - 1.2;
          leaf.ySpeed = Math.random();
    
          return leaf;
        }
        this._updateLeaf = function(leaf) {
          let leafWindSpeed = this.options.wind.speed(this.timer - this.options.wind.start, leaf.y);
    
          let xSpeed = leafWindSpeed + leaf.xSpeedVariation;
          leaf.x -= xSpeed;
          leaf.y += leaf.ySpeed;
          leaf.rotation.value += leaf.rotation.speed;
    
          let t = 'translateX( ' + leaf.x + 'px ) translateY( ' + leaf.y + 'px ) translateZ( ' + leaf.z + 'px )  rotate' + leaf.rotation.axis + '( ' + leaf.rotation.value + 'deg )';
          if (leaf.rotation.axis !== 'X') {
            t += ' rotateX(' + leaf.rotation.x + 'deg)';
          }
          leaf.el.style.webkitTransform = t;
          leaf.el.style.MozTransform = t;
          leaf.el.style.oTransform = t;
          leaf.el.style.transform = t;
    
          // reset if out of view
          if (leaf.x < -10 || leaf.y > this.height + 10) {
            this._resetLeaf(leaf);
          }
        }
    
        this._updateWind = function() {
          // wind follows a sine curve: asin(b*time + c) + a
          // where a = wind magnitude as a function of leaf position, b = wind.duration, c = offset
          // wind duration should be related to wind magnitude, e.g. higher windspeed means longer gust duration
    
          if (this.timer === 0 || this.timer > (this.options.wind.start + this.options.wind.duration)) {
    
            this.options.wind.magnitude = Math.random() * this.options.wind.maxSpeed;
            this.options.wind.duration = this.options.wind.magnitude * 50 + (Math.random() * 20 - 10);
            this.options.wind.start = this.timer;
    
            let screenHeight = this.height;
    
            this.options.wind.speed = function(t, y) {
              // should go from full wind speed at the top, to 1/2 speed at the bottom, using leaf Y
              let a = this.magnitude/2 * (screenHeight - 2*y/3)/screenHeight;
              return a * Math.sin(2*Math.PI/this.duration * t + (3 * Math.PI/2)) + a;
            }
          }
        }
      }
    
      LeafScene.prototype.init = function() {
    
        for (let i = 0; i < this.options.numLeaves; i++) {
          let leaf = {
            el: document.createElement('div'),
            x: 0,
            y: 0,
            z: 0,
            rotation: {
              axis: 'X',
              value: 0,
              speed: 0,
              x: 0
            },
            xSpeedVariation: 0,
            ySpeed: 0,
            path: {
              type: 1,
              start: 0,
    
            },
            image: 1
          };
          this._resetLeaf(leaf);
          this.leaves.push(leaf);
          this.world.appendChild(leaf.el);
        }
        // Child nodes become seasonal sprite
        this.world.childNodes.forEach(e=>e.className += weatherAssets.season);
      
        this.world.className = 'sprite-scene';
        this.viewport.appendChild(this.world);
        // set perspective
        this.world.style.webkitPerspective = "400px";
        this.world.style.MozPerspective = "400px";
        this.world.style.oPerspective = "400px";
        this.world.style.perspective = "400px";
    
        // reset window height/width on resize
        let self = this;
        window.onresize = function(event) {
          self.width = self.viewport.offsetWidth;
          self.height = self.viewport.offsetHeight;
        };
      }
    
      LeafScene.prototype.render = function() {
        this._updateWind();
        for (let i = 0; i < this.leaves.length; i++) {
          this._updateLeaf(this.leaves[i]);
        }
    
        this.timer++;
    
        requestAnimationFrame(this.render.bind(this));
      }
    
      // start up leaf scene
      let leafContainer = document.querySelector('.falling-leaves'),
      leaves = new LeafScene(leafContainer);
      leaves.init();
      leaves.render();
}

function percipitation () {
    let p = document.getElementsByClassName('percipitation');
    let increment = 0;
    let drops = '';
    let backDrops = '';
    
    while (increment < 100) {
      let randoHundo = (Math.floor(Math.random() * (98 - 1 + 1) + 1));
      let randoFiver = (Math.floor(Math.random() * (5 - 2 + 1) + 2));
      increment += randoFiver;
      drops += '<div class="drop" style="left: ' + increment + '%; bottom: ' + (randoFiver + randoFiver - 1 + 100) + '%; animation-delay: 0.' + randoHundo + 's; animation-duration: 0.5' + randoHundo + 's;"><div class="stem" style="animation-delay: 0.' + randoHundo + 's; animation-duration: 0.5' + randoHundo + 's;"></div><div class="splat" style="animation-delay: 0.' + randoHundo + 's; animation-duration: 0.5' + randoHundo + 's;"></div></div>';
      backDrops += '<div class="drop" style="right: ' + increment + '%; bottom: ' + (randoFiver + randoFiver - 1 + 100) + '%; animation-delay: 0.' + randoHundo + 's; animation-duration: 0.5' + randoHundo + 's;"><div class="stem" style="animation-delay: 0.' + randoHundo + 's; animation-duration: 0.5' + randoHundo + 's;"></div><div class="splat" style="animation-delay: 0.' + randoHundo + 's; animation-duration: 0.5' + randoHundo + 's;"></div></div>';
      let d = document.createElement('div'); // is a node
      d.innerHTML = '<div class="drop" style="left: ' + increment + '%; bottom: ' + (randoFiver + randoFiver - 1 + 100) + '%; animation-delay: 0.' + randoHundo + 's; animation-duration: 0.5' + randoHundo + 's;"><div class="stem" style="animation-delay: 0.' + randoHundo + 's; animation-duration: 0.5' + randoHundo + 's;"></div><div class="splat" style="animation-delay: 0.' + randoHundo + 's; animation-duration: 0.5' + randoHundo + 's;"></div></div>';
      p[0].appendChild(d);
    }
  }

// Tones 
// const synth = new Tone.FMSynth({
//     oscillator: {
//         type: 'sine'
//       },
//       envelope: {
//         attack: 0.1,
//         decay: 2,
//         sustain: 0.8,
//         release: 5
//       }
//   }).toMaster();

// function synthFire() {
//     let randomOct = Math.floor((Math.random() * 4) + 1);
//     let notes = ['A', 'D', 'C', 'G', 'C'];
//     let note = notes[Math.floor(Math.random() * notes.length)] + Math.floor((Math.random() * 4) + 1);
//     let noteTwo = notes[Math.floor(Math.random() * notes.length)] + Math.floor((Math.random() * 4) + 1);
//     let noteThree = notes[Math.floor(Math.random() * notes.length)] + Math.floor((Math.random() * 4) + 1);
//     let noteFour = notes[Math.floor(Math.random() * notes.length)] + Math.floor((Math.random() * 4) + 1);
//     console.log(note + noteTwo + noteThree + noteFour);
//     let now = Tone.now();
  
//     progression = [
//       ['C2', 'C4', 'D3'],
//       [],
//       []
//     ];
//     synth.triggerAttackRelease([note, noteTwo, noteFour], "8n", now);
//   }

function toneFire(){
    let track;
    console.log(weatherData.weather[0].description);
    if(weatherData.weather[0].description == 'clear sky'){ track =  '../assets/audio/clear_sky.mp3'};
    if(weatherData.weather[0].description == 'rain'){ track =  '../assets/audio/rain.mp3'};
    if(weatherData.weather[0].description == 'snow'){ track =  '../assets/audio/snow.mp3'};
    if(weatherData.weather[0].description == 'mist'){ track =  '../assets/audio/mist.mp3'};
    if(weatherData.weather[0].description == 'shower rain'){ track =  '../assets/audio/shower_rain.mp3'};
    if(weatherData.weather[0].description == 'scattered clouds'){ track =  '../assets/audio/scattered_clouds.mp3'};
    if(weatherData.weather[0].description == 'broken clouds'){ track =  '../assets/audio/broken_clouds.mp3'};
    const player = new Tone.Player(track).toDestination();
    player.autostart = true;
}

document.addEventListener('click', function (event) {
	if (!event.target.matches('.clickable')) return;
	event.preventDefault();
    console.log(event.target);
    toneFire()
}, false);

// Acknowledgments:::::::: //////////////////////////////
// Shout out to Sarah Higley's Falling Leaves simulation,
// && a special shout out to  A. Rickles's rain effect.