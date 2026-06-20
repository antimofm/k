// Shared Kindle night-dashboard logic. Loaded by /k/ (root), /k/a/ (Antimo),
// /k/c/ (Chiara). Identity comes from window.WHO (set by the per-room stub) or
// the ?who= query param; defaults to antimo. Data files (events.json,
// ambient.json) are fetched relative to THIS script so the /a and /c subpaths
// still read /k/events.json etc.
(function () {
var S = document.currentScript;
var BASE = S ? S.src.replace(/app\.js(\?.*)?$/, "") : "";

var STYLE =
"* { margin:0; padding:0; box-sizing:border-box; }" +
"body { background:#000; color:#fff; font-family:'Courier New',Courier,monospace; padding:20px 16px; max-width:600px; margin:0 auto; font-size:14px; line-height:1.4; -webkit-text-size-adjust:100%; }" +
".dim { color:#888; }" +
".spacer { height:16px; }" +
".label { color:#888; font-size:11px; letter-spacing:2px; text-transform:uppercase; margin-bottom:6px; }" +
".line { margin-bottom:4px; }" +
".quote { line-height:1.55; margin-bottom:6px; }" +
".weather-grid { margin:6px 0; }" +
".weather-grid div { margin-bottom:2px; }" +
"#who { position:absolute; top:8px; right:12px; color:#555; font-size:10px; letter-spacing:2px; text-transform:uppercase; }";

var BODY =
'<div id="who"></div>' +
'<div id="date" style="margin-bottom:12px"></div>' +
'<div class="spacer"></div>' +
'<div id="weather"><div class="dim">loading weather...</div></div>' +
'<div class="spacer"></div>' +
'<div id="ambient"></div>' +
'<div class="spacer"></div>' +
'<div id="events"></div>' +
'<div class="spacer"></div>' +
'<div id="quote-block"><div class="quote" id="quote"></div><div class="dim" id="author"></div></div>' +
'<div class="spacer"></div>' +
'<div id="breath"></div>';

var st = document.createElement("style"); st.textContent = STYLE; document.head.appendChild(st);
document.body.innerHTML = BODY;

// Identity: window.WHO (from stub) | ?who= | default antimo.
var whoMap = { antimo: "Antimo", chiara: "Chiara" };
var raw = (window.WHO || (location.search.match(/[?&]who=([^&]+)/) || [])[1] || "antimo").toLowerCase();
var whoKey = whoMap[raw] ? raw : "antimo";
document.getElementById("who").textContent = whoMap[whoKey];

var now = new Date();
var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
document.getElementById("date").textContent = days[now.getDay()] + " " + now.getDate() + " " + months[now.getMonth()] + " " + now.getFullYear();

var quotes = [
  ["It is not that we have a short time to live, but that we waste a great deal of it. Life is long enough, and a sufficiently generous amount has been given to us for the highest achievements if it were all well invested.", "Seneca, On the Shortness of Life"],
  ["Have patience with everything unresolved in your heart and try to love the questions themselves, as if they were locked rooms or books written in a very foreign language. Do not now seek the answers, which cannot be given you because you would not be able to live them.", "Rilke, Letters to a Young Poet"],
  ["At dawn, when you have trouble getting out of bed, tell yourself: I have to go to work — as a human being. What do I have to complain of, if I’m going to do what I was born for — the things I was brought into the world to do? Or is this what I was created for? To huddle under the blankets and stay warm?", "Marcus Aurelius, Meditations"],
  ["In the middle of winter, I at last discovered that there was in me an invincible summer. And that makes me happy. For it says that no matter how hard the world pushes against me, within me, there’s something stronger — something better, pushing right back.", "Camus, Return to Tipasa"],
  ["Colui che sa di non avere tempo da perdere è già salvo, anche se non sa ancora come. Non è la certezza che conta, è il rifiuto di fermarsi.", "Cesare Pavese, Il mestiere di vivere"],
  ["The thing about working for yourself is that every morning you wake up unemployed. You have to earn your job all over again. That sounds terrifying, and some days it is. But it also means that every morning you wake up free.", "Paul Graham"],
  ["A man is worked upon by what he works on. He may carve out his circumstances, but his circumstances will carve him out as well. A small daily task, if it be really daily, will beat the labours of a spasmodic Hercules.", "Anthony Trollope"],
  ["The years teach much which the days never know. The individual is always mistaken. He designed many things, and drew in other persons as coadjutors, quarrelled with some or all, blundered much, and something is done; all are a little advanced, but the individual is always mistaken.", "Emerson, Experience"],
  ["Sleep is the interest we have to pay on the capital which is called in at death; and the higher the rate of interest and the more regularly it is paid, the further the date of redemption is postponed. So says Schopenhauer, but I say: sleep is the kindness the body shows the mind, reminding it gently that it is not yet infinite.", "adapted from Schopenhauer"],
  ["I went to the woods because I wished to live deliberately, to front only the essential facts of life, and see if I could not learn what it had to teach, and not, when I came to die, discover that I had not lived.", "Thoreau, Walden"],
  ["One must imagine Sisyphus happy. The struggle itself toward the heights is enough to fill a man’s heart.", "Camus, The Myth of Sisyphus"],
  ["We are not provided with wisdom, we must discover it for ourselves, after a journey through the wilderness which no one else can take for us, an effort which no one can spare us.", "Proust, In Search of Lost Time"],
  ["Chi vuol muovere il mondo, prima muova sé stesso. The work you do on yourself is not separate from the work you do in the world. They are the same work, done in different rooms.", "Socrates, via Plutarch"],
  ["The secret of getting ahead is getting started. The secret of getting started is breaking your complex overwhelming tasks into small manageable tasks, and then starting on the first one. And then resting. And then starting again.", "Mark Twain"],
  ["There is a vitality, a life force, an energy that is translated through you into action, and because there is only one of you in all of time, this expression is unique. And if you block it, it will never exist through any other medium and it will be lost. It is not your business to determine how good it is nor how valuable. It is your business to keep the channel open.", "Martha Graham"],
  ["Ogni mattina in Africa, una gazzella si sveglia. Sa che dovrà correre più del leone o verrà uccisa. Ogni mattina un leone si sveglia. Sa che dovrà correre più della gazzella o morirà di fame. Non importa che tu sia un leone o una gazzella: quando il sole sorge, è meglio che cominci a correre. Ma di notte, anche il leone dorme.", "proverbio africano, con aggiunta"],
  ["Put your ear down close to your soul and listen hard. The only people for me are the mad ones, the ones who are mad to live, mad to talk, mad to be saved, desirous of everything at the same time, the ones who never yawn or say a commonplace thing, but burn, burn, burn like fabulous yellow roman candles.", "Kerouac, On the Road"],
  ["You do not need to leave your room. Remain sitting at your table and listen. Do not even listen, simply wait, be quiet, still and solitary. The world will freely offer itself to you to be unmasked. It has no choice; it will roll in ecstasy at your feet.", "Kafka"],
  ["The miracle is not to walk on water. The miracle is to walk on the green earth, dwelling deeply in the present moment and feeling truly alive.", "Thich Nhat Hanh"],
  ["L’uomo è ciò che decide di essere. Non ciò che gli accade, ma ciò che sceglie di fare con ciò che gli accade. Questo è il suo privilegio, il suo fardello, e la sua libertà.", "Primo Levi, Se questo è un uomo"]
];
// Chiara's set — Italian writers/scientists, women, wonder, courage to change, rest.
var chiaraQuotes = [
  ["And the day came when the risk to remain tight in a bud was more painful than the risk it took to blossom.", "Anaïs Nin"],
  ["Tell me, what is it you plan to do with your one wild and precious life?", "Mary Oliver, The Summer Day"],
  ["You do not have to be good. You do not have to walk on your knees for a hundred miles through the desert, repenting. You only have to let the soft animal of your body love what it loves.", "Mary Oliver, Wild Geese"],
  ["Nothing in life is to be feared, it is only to be understood. Now is the time to understand more, so that we may fear less.", "Marie Curie"],
  ["Non temete i momenti difficili. Il meglio viene da lì.", "Rita Levi-Montalcini"],
  ["Non dobbiamo insegnare le piccole virtù ma le grandi. Non il risparmio ma la generosità; non la prudenza ma il coraggio e il disprezzo del pericolo.", "Natalia Ginzburg, Le piccole virtù"],
  ["Cercare e saper riconoscere chi e cosa, in mezzo all’inferno, non è inferno, e farlo durare, e dargli spazio.", "Italo Calvino, Le città invisibili"],
  ["Those who contemplate the beauty of the earth find reserves of strength that will endure as long as life lasts.", "Rachel Carson"],
  ["I found that the more I worked with them the bigger they got, until finally they were right there with me — and these were my friends.", "Barbara McClintock, on her maize"],
  ["Sometimes the most important thing in a whole day is the rest we take between two deep breaths.", "Etty Hillesum"],
  ["Now I become myself. It’s taken time, many years and places; I have been dissolved and shaken, worn other people’s faces.", "May Sarton, Now I Become Myself"],
  ["It is good to have an end to journey toward; but it is the journey that matters, in the end.", "Ursula K. Le Guin"],
  ["What you do makes a difference, and you have to decide what kind of difference you want to make.", "Jane Goodall"],
  ["Instructions for living a life: Pay attention. Be astonished. Tell about it.", "Mary Oliver"],
  ["The great thing about getting older is that you don’t lose all the other ages you’ve been.", "Madeleine L’Engle"],
  ["You may not control all the events that happen to you, but you can decide not to be reduced by them.", "Maya Angelou"],
  ["Attention is the rarest and purest form of generosity.", "Simone Weil"],
  ["Caring for myself is not self-indulgence, it is self-preservation.", "Audre Lorde"],
  ["Siamo fatti della stessa materia di cui sono fatte le stelle.", "Margherita Hack"],
  ["Within you there is a stillness and a sanctuary to which you can retreat at any time and be yourself.", "Hermann Hesse"]
];
var qset = (whoKey === "chiara") ? chiaraQuotes : quotes;
var idx = now.getDate() % qset.length;
document.getElementById("quote").textContent = "“" + qset[idx][0] + "”";
document.getElementById("author").textContent = "— " + qset[idx][1];

var poems = [
  ["古池や蛙飛び込む水の音", "The old pond—\na frog jumps in,\nsound of water.", "Matsuo Bashō"],
  ["木枯らし風のなきにも紅葉哉", "Over the wintry\nforest, winds howl in rage\nwith no leaves to blow.", "Natsume Sōseki"],
  ["夏草や兵どもが夢の跡", "The summer grasses—\nall that remains of the dreams\nof warriors.", "Matsuo Bashō"],
  ["灯を消して涼しき星の窓かな", "The lamp once out\ncool stars enter\nthe window frame.", "Natsume Sōseki"],
  ["坐照すれば春来たり草自ら生ず", "Sitting quietly, doing nothing,\nspring comes,\nand the grass grows by itself.", "Zenrin Kushū"],
  ["鐘消えて花の香は撞く夕哉", "The temple bell stops—\nbut the sound keeps coming\nout of the flowers.", "Matsuo Bashō"],
  ["月天心如水　彩雲正好繞青天", "The moon’s heart is like water,\nbright clouds embroider\nthe blue sky.", "Li Bai"],
  ["京にても京なつかしやほととぎす", "Even in Kyoto—\nhearing the cuckoo’s cry—\nI long for Kyoto.", "Matsuo Bashō"],
  ["やせ蛙負けるな一茶これにあり", "Lean frog,\ndon’t give up the fight!\nIssa is here.", "Kobayashi Issa"],
  ["露の世は露の世ながらさりながら", "A world of dew,\nand within every dewdrop\na world of struggle.", "Kobayashi Issa"],
  ["雲おりおり人を休める月見かな", "From time to time\nthe clouds give rest\nto the moon-beholders.", "Matsuo Bashō"],
  ["月水に砕けて砕けてなお月あり", "The moon in the water;\nbroken and broken again,\nstill it is there.", "Chosu"],
  ["淡雪のうすき日影の山路かな", "Light snow—\nfaint sun-shadows\nalong the mountain path.", "Ryōkan"],
  ["盗人に取残されし窓の月", "The thief left it behind:\nthe moon\nat my window.", "Ryōkan"],
  ["蝶々のひらひら渡る夢の橋", "Fluttering, trembling,\nthe butterfly passed over—\nthe bridge of dreams.", "Chiyo-ni"],
  ["古人の跡を求めず古人の求めたる所を求めよ", "Do not seek to follow\nin the footsteps of the wise.\nSeek what they sought.", "Matsuo Bashō"],
  ["空山不見人　但聞人語声\n返景入深林　復照青苔上", "Empty mountain, no one in sight—\nonly the sound of voices.\nLight returns to the deep forest\nand shines upon the moss.", "Wang Wei, 鹿柴"],
  ["名月や池をめぐりて夜もすがら", "Moonlit night—\nI walk around the pond—\nhey, the dawn.", "Matsuo Bashō"],
  ["物言はず主客と白菊花", "No one spoke.\nThe host, the guest,\nthe white chrysanthemum.", "Oshima Ryōta"],
  ["雁行無意下池塘　池塘無心留雁影", "The wild geese do not intend\nto cast their reflection.\nThe water has no mind\nto receive their image.", "Zenrin Kushū"]
];
var pidx = now.getDate() % poems.length;
var phtml = "<div class='line'>" + poems[pidx][0] + "</div>";
phtml += "<div style='height:8px'></div>";
var plines = poems[pidx][1].split("\n");
for (var p = 0; p < plines.length; p++) {
  phtml += "<div class='line dim'>" + plines[p] + "</div>";
}
phtml += "<div class='dim' style='margin-top:4px'>— " + poems[pidx][2] + "</div>";
document.getElementById("breath").innerHTML = phtml;

// This room's ambient readings — ambient.json (~/bin/kindle-ambient).
// antimo -> Rhea's bedroom (Awair, has CO2/score); chiara -> Master bedroom (Vindstyrka, no CO2).
var ahxr = new XMLHttpRequest();
ahxr.open("GET", BASE + "ambient.json?t=" + now.getTime(), true);
ahxr.onreadystatechange = function() {
  if (ahxr.readyState !== 4) return;
  var box = document.getElementById("ambient");
  if (ahxr.status !== 200) { box.innerHTML = "<div class='label'>This room</div><div class='line dim'>—</div>"; return; }
  var a;
  try { a = JSON.parse(ahxr.responseText).rooms[whoKey]; } catch (e) { a = null; }
  if (!a) { box.innerHTML = "<div class='label'>This room</div><div class='line dim'>—</div>"; return; }
  var html = "<div class='label'>This room · " + a.room + "</div>";
  var bits = [];
  if (a.temp != null) bits.push(a.temp + "°C");
  if (a.rh != null) bits.push(a.rh + "% RH");
  if (a.co2 != null) bits.push("CO2 " + a.co2);
  if (a.voc != null) bits.push("VOC " + a.voc);
  if (a.pm25 != null) bits.push("PM2.5 " + a.pm25);
  html += "<div class='line'>" + bits.join("   ") + "</div>";
  var tail = a.sensor || "";
  if (a.score != null) tail += " " + a.score;
  html += "<div class='line dim'>" + tail + "</div>";
  if (a.humidifier) {
    var h = a.humidifier;
    var hl = "Humidifier " + (h.rh != null ? h.rh + "%" : "?");
    if (h.target != null) hl += " → " + h.target + "%";
    if (h.mode) hl += " · " + h.mode;
    if (h.water_low) hl += "  ⚠ refill";
    html += "<div class='line dim'>" + hl + "</div>";
  }
  box.innerHTML = html;
};
ahxr.send();

// Tomorrow's events — events.json (~/bin/kindle-events). Times only (obfuscated, public).
var exhr = new XMLHttpRequest();
exhr.open("GET", BASE + "events.json?t=" + now.getTime(), true);
exhr.onreadystatechange = function() {
  if (exhr.readyState !== 4) return;
  var html = "<div class='label'>Tomorrow</div>";
  if (exhr.status === 200) {
    try {
      var ev = JSON.parse(exhr.responseText);
      html = "<div class='label'>Tomorrow · " + ev.date + "</div>";
      if (ev.events && ev.events.length) {
        for (var i = 0; i < ev.events.length; i++) {
          var e = ev.events[i];
          html += "<div class='line'><span class='dim'>" + e.time + "</span>  " + e.title + "</div>";
        }
      } else {
        html += "<div class='line dim'>Nothing scheduled</div>";
      }
    } catch (err) {
      html += "<div class='line dim'>—</div>";
    }
  } else {
    html += "<div class='line dim'>—</div>";
  }
  document.getElementById("events").innerHTML = html;
};
exhr.send();

var xhr = new XMLHttpRequest();
xhr.open("GET", "https://api.open-meteo.com/v1/forecast?latitude=52.24&longitude=0.24&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,relative_humidity_2m,surface_pressure,cloud_cover,precipitation&hourly=precipitation_probability,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code,sunrise,sunset,uv_index_max,precipitation_sum,wind_speed_10m_max,wind_direction_10m_dominant&timezone=Europe/London&forecast_days=3", true);
xhr.onreadystatechange = function() {
  if (xhr.readyState !== 4 || xhr.status !== 200) return;
  var d = JSON.parse(xhr.responseText);
  var c = d.current;
  var daily = d.daily;
  var hourly = d.hourly;

  var wmoShort = function(code) {
    var m = {0:"Clear",1:"Mostly clear",2:"Partly cloudy",3:"Overcast",45:"Fog",48:"Freezing fog",51:"Light drizzle",53:"Drizzle",55:"Heavy drizzle",61:"Light rain",63:"Rain",65:"Heavy rain",71:"Light snow",73:"Snow",75:"Heavy snow",80:"Light showers",81:"Showers",82:"Heavy showers",95:"Thunderstorm"};
    return m[code] || "---";
  };

  var windDir = function(deg) {
    var dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
    return dirs[Math.round(deg / 22.5) % 16];
  };

  var beaufort = function(kmh) {
    if (kmh < 2) return "calm";
    if (kmh < 6) return "light air";
    if (kmh < 12) return "light breeze";
    if (kmh < 20) return "gentle breeze";
    if (kmh < 29) return "moderate breeze";
    if (kmh < 39) return "fresh breeze";
    if (kmh < 50) return "strong breeze";
    if (kmh < 62) return "near gale";
    if (kmh < 75) return "gale";
    if (kmh < 89) return "strong gale";
    return "storm";
  };

  var pressureDesc = function(hpa) {
    if (hpa >= 1030) return "high";
    if (hpa >= 1015) return "steady";
    if (hpa >= 1000) return "low";
    return "very low";
  };

  var currentHour = now.getHours();
  var todayStr = now.getFullYear() + "-" + String(now.getMonth()+1).padStart(2,"0") + "-" + String(now.getDate()).padStart(2,"0");
  var rainProbs = [];
  for (var hh = 0; hh < hourly.time.length && rainProbs.length < 6; hh++) {
    if (hourly.time[hh] >= todayStr + "T" + String(currentHour).padStart(2,"0")) {
      rainProbs.push(hourly.precipitation_probability[hh]);
    }
  }
  var maxRainProb = Math.max.apply(null, rainProbs.length ? rainProbs : [0]);

  var sunrise = daily.sunrise[0].split("T")[1];
  var sunset = daily.sunset[0].split("T")[1];

  var wh = "";
  wh += "LODE  " + Math.round(c.temperature_2m) + "°C  " + wmoShort(c.weather_code) + "  " + Math.round(c.wind_speed_10m) + " km/h";
  wh += "<br><br>";
  wh += "<div class='weather-grid'>";
  wh += "<div>Feels like " + Math.round(c.apparent_temperature) + "°C    Humidity " + c.relative_humidity_2m + "%    Cloud " + c.cloud_cover + "%</div>";
  wh += "<div>Pressure " + Math.round(c.surface_pressure) + " hPa (" + pressureDesc(c.surface_pressure) + ")    Dew point " + Math.round(c.temperature_2m - ((100 - c.relative_humidity_2m) / 5)) + "°C</div>";
  wh += "<div>Wind " + windDir(c.wind_direction_10m) + " " + Math.round(c.wind_speed_10m) + " km/h (" + beaufort(c.wind_speed_10m) + ")</div>";
  wh += "<div>UV " + Math.round(daily.uv_index_max[0]) + "    Rain " + maxRainProb + "% next 6h    Precip " + (c.precipitation > 0 ? c.precipitation + " mm" : "none") + "</div>";
  wh += "<div>Sunrise " + sunrise + "    Sunset " + sunset + "</div>";
  wh += "</div>";

  document.getElementById("weather").innerHTML = wh;
};
xhr.send();
})();
