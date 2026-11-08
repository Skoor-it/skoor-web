// The court at night behind the top of the home page: one sport's lines, net, walls, hoops or goals,
// and a ball playing a rally the way that sport is played, with a green trail and a ring where it's
// hit. three.js draws it. With "reduce motion" on, one still picture is drawn.
import * as T from './vendor/three.module.min.js';

export const SCENES = ['badminton', 'padel', 'tennis', 'tabletennis', 'squash', 'pickleball', 'beachvolleyball', 'volleyball', 'basketball', 'handball', 'rugby', 'football'];

export function startCourt(el, id) {
  let renderer;
  try {
    renderer = new T.WebGLRenderer({ canvas: el, antialias: true, alpha: true });
  } catch {
    return () => {}; // no WebGL: the black background stays
  }
  let stopped = false;
  let raf = 0;
  let visible = true;
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(40, 1, 0.05, 600);
  const rnd = (a, b) => a + Math.random() * (b - a);
  const V = (x, y, z) => new T.Vector3(x, y, z);
  const lines = [];
  const seg = (x1, z1, x2, z2, y = 0.002) => lines.push(x1, y, z1, x2, y, z2);
  const rect = (x1, z1, x2, z2, y) => { seg(x1, z1, x2, z1, y); seg(x2, z1, x2, z2, y); seg(x2, z2, x1, z2, y); seg(x1, z2, x1, z1, y); };
  const arc = (cx, cz, r, a0, a1, y = 0.002, n = 40) => {
    for (let i = 0; i < n; i += 1) {
      const p = a0 + (a1 - a0) * i / n;
      const q = a0 + (a1 - a0) * (i + 1) / n;
      seg(cx + r * Math.sin(p), cz + r * Math.cos(p), cx + r * Math.sin(q), cz + r * Math.cos(q), y);
    }
  };
  const extra = []; // lines in the air: nets, walls, goals
  const up = (x1, y1, z1, x2, y2, z2) => extra.push(x1, y1, z1, x2, y2, z2);
  const basic = (color, opacity = 1) => new T.MeshBasicMaterial({ color, transparent: opacity < 1, opacity, side: T.DoubleSide });
  const add = (mesh, x, y, z) => { mesh.position.set(x, y, z); scene.add(mesh); return mesh; };
  const net = (w, top, bottom = 0, step = 0.2) => {
    for (let x = -w / 2; x <= w / 2 + 0.001; x += step) up(x, bottom, 0, x, top, 0);
    for (let y = bottom; y <= top + 0.001; y += step) up(-w / 2, y, 0, w / 2, y, 0);
    add(new T.Mesh(new T.BoxGeometry(w, 0.05, 0.02), basic(0xffffff)), 0, top, 0);
    [-1, 1].forEach((s) => add(new T.Mesh(new T.CylinderGeometry(0.03, 0.03, top, 8), basic(0x777777)), s * (w / 2 + 0.05), top / 2, 0));
  };
  const glass = (w, h, x, z, turn) => {
    const g = add(new T.Mesh(new T.PlaneGeometry(w, h), basic(0x9fd8ff, 0.07)), x, h / 2, z);
    if (turn) g.rotation.y = Math.PI / 2;
    const dx = turn ? 0 : w / 2;
    const dz = turn ? w / 2 : 0;
    up(x - dx, h, z - dz, x + dx, h, z + dz); up(x - dx, 0, z - dz, x - dx, h, z - dz); up(x + dx, 0, z + dz, x + dx, h, z + dz);
  };

  // The sports. L: length (along the camera), W: width; cam: [distance, height, look at height]; r: ball radius.
  const S = {
    badminton: { L: 13.4, W: 6.1, floor: 0x0a120d, cam: [15, 7.5, 1.2], ball: 'shuttle', r: 0.06, trail: 0.09,
      build() {
        const W = 3.05; const Sg = 2.59; const L = 6.7;
        rect(-W, -L, W, L); seg(-Sg, -L, -Sg, L); seg(Sg, -L, Sg, L);
        [-1, 1].forEach((s) => { seg(-W, s * 1.98, W, s * 1.98); seg(-W, s * 5.94, W, s * 5.94); seg(0, s * 1.98, 0, s * L); });
        net(6.1, 1.55, 0.8, 0.15);
      } },
    tennis: { L: 23.77, W: 10.97, floor: 0x0b1424, cam: [31, 12, 0.6], ball: 0xd9f23a, r: 0.12, trail: 0.16,
      build() {
        const W = 5.485; const Sg = 4.115; const L = 11.885;
        rect(-W, -L, W, L); seg(-Sg, -L, -Sg, L); seg(Sg, -L, Sg, L);
        [-1, 1].forEach((s) => { seg(-Sg, s * 6.4, Sg, s * 6.4); seg(0, 0, 0, s * 6.4); seg(0, s * L, 0, s * (L - 0.2)); });
        net(12.8, 0.914, 0, 0.25);
      },
      bounce: { netY: 0.914, land: [3, 11], hit: [10.5, 13.5], hitY: 1, peak: [1.6, 2.6], dur: [0.85, 1.15] } },
    padel: { L: 20, W: 10, floor: 0x0d1830, cam: [24, 10, 0.8], ball: 0xd9f23a, r: 0.11, trail: 0.15,
      build() {
        rect(-5, -10, 5, 10);
        [-1, 1].forEach((s) => { seg(-5, s * 6.95, 5, s * 6.95); seg(0, 0, 0, s * 6.95); glass(10, 3, 0, s * 10, false); glass(2, 3, -5, s * 9, true); glass(2, 3, 5, s * 9, true); });
        net(10, 0.88, 0, 0.2);
      },
      bounce: { netY: 0.88, land: [3, 9], hit: [7.5, 9.3], hitY: 0.9, peak: [1.4, 2.4], dur: [0.8, 1.05], wall: 10 } },
    pickleball: { L: 13.41, W: 6.1, floor: 0x0e1c16, cam: [15, 7, 0.6], ball: 0xd9f23a, r: 0.075, trail: 0.11,
      build() {
        rect(-3.05, -6.705, 3.05, 6.705);
        [-1, 1].forEach((s) => { seg(-3.05, s * 2.13, 3.05, s * 2.13); seg(0, s * 2.13, 0, s * 6.705); });
        net(6.6, 0.86, 0, 0.15);
      },
      bounce: { netY: 0.86, land: [1.2, 6], hit: [2.4, 6.6], hitY: 0.7, peak: [1.0, 2.0], dur: [0.8, 1.2] } },
    tabletennis: { L: 2.74, W: 1.525, floor: 0x050505, cam: [4.8, 2.7, 0.8], ball: 0xffffff, r: 0.02, trail: 0.025,
      build() {
        add(new T.Mesh(new T.BoxGeometry(1.525, 0.03, 2.74), basic(0x0c2a52)), 0, 0.745, 0);
        rect(-0.7625, -1.37, 0.7625, 1.37, 0.762); seg(0, -1.37, 0, 1.37, 0.762);
        [-1, 1].forEach((s) => [-1, 1].forEach((u) => add(new T.Mesh(new T.BoxGeometry(0.05, 0.73, 0.05), basic(0x333333)), s * 0.65, 0.365, u * 1.15)));
        for (let x = -0.915; x <= 0.916; x += 0.06) up(x, 0.76, 0, x, 0.9125, 0);
        for (let y = 0.76; y <= 0.913; y += 0.05) up(-0.915, y, 0, 0.915, y, 0);
        add(new T.Mesh(new T.BoxGeometry(1.83, 0.012, 0.012), basic(0xffffff)), 0, 0.9125, 0);
      },
      bounce: { netY: 0.92, floorY: 0.78, land: [0.3, 1.25], hit: [1.6, 2.4], hitY: 0.95, peak: [0.98, 1.15], dur: [0.38, 0.5], x: 0.65 } },
    squash: { L: 9.75, W: 6.4, floor: 0x1c140b, cam: [12, 6, 1.8], ball: 0x9a9a9a, r: 0.02, trail: 0.06,
      build() {
        const F = -4.875;
        rect(-3.2, F, 3.2, 4.875); seg(-3.2, F + 5.49, 3.2, F + 5.49); seg(0, F + 5.49, 0, 4.875);
        [-1, 1].forEach((s) => rect(s * 1.6, F + 5.49, s * 3.2, F + 7.09));
        add(new T.Mesh(new T.PlaneGeometry(6.4, 4.57), basic(0x141414)), 0, 2.285, F);
        [0.48, 1.78, 4.57].forEach((y) => up(-3.2, y, F + 0.01, 3.2, y, F + 0.01));
        [-1, 1].forEach((s) => { up(s * 3.2, 4.57, F, s * 3.2, 2.13, 4.875); up(s * 3.2, 0, F, s * 3.2, 4.57, F); });
      },
      squash: true },
    beachvolleyball: { L: 16, W: 8, floor: 0x2a2114, cam: [20, 8.5, 1.6], ball: 0xf5f0d8, r: 0.11, trail: 0.15,
      build() { rect(-4, -8, 4, 8); net(8.5, 2.43, 1.43, 0.15); },
      volley: true },
    volleyball: { L: 18, W: 9, floor: 0x1a120a, cam: [21, 9, 1.8], ball: 0xf5e7b0, r: 0.105, trail: 0.15,
      build() { rect(-4.5, -9, 4.5, 9); seg(-4.5, 3, 4.5, 3); seg(-4.5, -3, 4.5, -3); net(9.5, 2.43, 1.43, 0.15); },
      volley: true },
    basketball: { L: 28, W: 15, floor: 0x1d140b, cam: [31, 13, 2], ball: 0xe06a1b, r: 0.12, trail: 0.16,
      build() {
        rect(-7.5, -14, 7.5, 14); seg(-7.5, 0, 7.5, 0); arc(0, 0, 1.8, 0, Math.PI * 2);
        [-1, 1].forEach((s) => {
          const hz = s * (14 - 1.575); const m = Math.asin(6.6 / 6.75);
          rect(-2.45, s * 14, 2.45, s * (14 - 5.8)); arc(0, s * (14 - 5.8), 1.8, 0, Math.PI * 2);
          arc(0, hz, 6.75, -m + (s > 0 ? Math.PI : 0), m + (s > 0 ? Math.PI : 0));
          const ez = hz - s * 6.75 * Math.cos(m);
          seg(-6.6, s * 14, -6.6, ez); seg(6.6, s * 14, 6.6, ez);
          add(new T.Mesh(new T.PlaneGeometry(1.8, 1.05), basic(0xffffff, 0.12)), 0, 3.4, s * (14 - 1.2));
          up(-0.9, 2.9, s * (14 - 1.2), 0.9, 2.9, s * (14 - 1.2)); up(-0.9, 3.95, s * (14 - 1.2), 0.9, 3.95, s * (14 - 1.2));
          up(-0.9, 2.9, s * (14 - 1.2), -0.9, 3.95, s * (14 - 1.2)); up(0.9, 2.9, s * (14 - 1.2), 0.9, 3.95, s * (14 - 1.2));
          const ring = add(new T.Mesh(new T.TorusGeometry(0.23, 0.015, 8, 32), basic(0xe06a1b)), 0, 3.05, hz);
          ring.rotation.x = Math.PI / 2;
        });
      },
      hoops: true },
    handball: { L: 40, W: 20, floor: 0x0f1626, cam: [40, 17, 1.2], ball: 0xe8d36a, r: 0.095, trail: 0.2,
      build() {
        rect(-10, -20, 10, 20); seg(-10, 0, 10, 0);
        [-1, 1].forEach((s) => {
          const z = s * 20;
          // the goal area (6 m) and the free-throw line (9 m, dashed): quarter circles from each post and a line between
          [6, 9].forEach((r) => {
            const n = r === 9 ? 24 : 40;
            [-1, 1].forEach((side) => {
              for (let i = 0; i < n; i += 1) {
                if (r === 9 && i % 2) continue;
                const a0 = Math.PI / 2 * i / n, a1 = Math.PI / 2 * (i + 1) / n;
                seg(side * (1.5 + r * Math.sin(a0)), z - s * r * Math.cos(a0), side * (1.5 + r * Math.sin(a1)), z - s * r * Math.cos(a1));
              }
            });
            if (r === 6) seg(-1.5, z - s * 6, 1.5, z - s * 6);
            else for (let x = -1.5; x < 1.5; x += 0.6) seg(x, z - s * 9, Math.min(1.5, x + 0.3), z - s * 9);
          });
          up(-1.5, 0, z, -1.5, 2, z); up(1.5, 0, z, 1.5, 2, z); up(-1.5, 2, z, 1.5, 2, z);
          up(-1.5, 2, z, -1.5, 0, z + s); up(1.5, 2, z, 1.5, 0, z + s); up(-1.5, 0, z + s, 1.5, 0, z + s);
          for (let x = -1.5; x <= 1.51; x += 0.5) up(x, 2, z, x, 0, z + s);
        });
      },
      pitch: { goalZ: 19.9, goalW: 1.3, goalH: [0.3, 1.8], xr: 9, zr: 17, speed: 14, loftH: [3, 5], shot: 0.25, back: [4, 12], backX: 8 } },
    rugby: { L: 120, W: 70, floor: 0x0c1a0c, cam: [104, 46, 0], ball: 'oval', r: 0.45, trail: 0.7,
      build() {
        rect(-35, -60, 35, 60); seg(-35, 0, 35, 0);
        [-1, 1].forEach((s) => {
          seg(-35, s * 50, 35, s * 50); seg(-35, s * 28, 35, s * 28);                          // try line, 22 m line
          for (let x = -35; x < 35; x += 4) seg(x, s * 10, x + 2, s * 10);                      // 10 m line, dashed
          const z = s * 50;                                                                     // the H: posts 5.6 m apart, bar at 3 m
          up(-2.8, 0, z, -2.8, 13, z); up(2.8, 0, z, 2.8, 13, z); up(-2.8, 3, z, 2.8, 3, z);
        });
      },
      pitch: { goalZ: 50, posts: true, xr: 32, zr: 46, speed: 18, loftH: [9, 16], shot: 0.1, back: [15, 40], backX: 25 } },
    football: { L: 105, W: 68, floor: 0x0a1a0e, cam: [92, 40, 0], ball: 0xffffff, r: 0.4, trail: 0.7,
      build() {
        rect(-34, -52.5, 34, 52.5); seg(-34, 0, 34, 0); arc(0, 0, 9.15, 0, Math.PI * 2);
        [-1, 1].forEach((s) => {
          rect(-20.16, s * 52.5, 20.16, s * (52.5 - 16.5)); rect(-9.16, s * 52.5, 9.16, s * (52.5 - 5.5));
          const z = s * 52.5;
          up(-3.66, 0, z, -3.66, 2.44, z); up(3.66, 0, z, 3.66, 2.44, z); up(-3.66, 2.44, z, 3.66, 2.44, z);
          up(-3.66, 2.44, z, -3.66, 0, z + s * 2); up(3.66, 2.44, z, 3.66, 0, z + s * 2); up(-3.66, 0, z + s * 2, 3.66, 0, z + s * 2);
          for (let x = -3.66; x <= 3.67; x += 0.6) up(x, 2.44, z, x, 0, z + s * 2);
        });
      },
      pitch: true },
  };
  const sp = S[id] ?? S.badminton;
  const [camR, camH, lookY] = sp.cam;
  scene.fog = new T.Fog(0x000000, camR * 0.9, camR * 2.4);
  sp.build();
  const floor = add(new T.Mesh(new T.PlaneGeometry(sp.W * 1.7 + 6, sp.L * 1.35 + 6), basic(sp.floor)), 0, -0.01, 0);
  floor.rotation.x = -Math.PI / 2;
  const lineSet = (arr, opacity) => {
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(arr, 3));
    scene.add(new T.LineSegments(g, new T.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity })));
  };
  lineSet(lines, 0.55);
  if (extra.length) lineSet(extra, 0.2);

  // The ball: a shuttle (white skirt, cork) or a ball in the sport's colour.
  const ball = new T.Group();
  if (sp.ball === 'shuttle') {
    const skirt = new T.Mesh(new T.ConeGeometry(0.13, 0.28, 16, 1, true), basic(0xffffff, 0.9));
    skirt.position.y = 0.1;
    const cork = new T.Mesh(new T.SphereGeometry(0.06, 12, 12), basic(0xffffff));
    cork.position.y = -0.06;
    ball.add(skirt, cork);
  } else if (sp.ball === 'oval') {
    const oval = new T.Mesh(new T.SphereGeometry(sp.r * 1.6, 16, 16), basic(0xf0e6d0));
    oval.scale.set(1, 1, 1.7);
    ball.add(oval);
  } else {
    ball.add(new T.Mesh(new T.SphereGeometry(sp.r * 1.6, 16, 16), basic(sp.ball)));
  }
  scene.add(ball);
  const N = 46;
  const trail = new Float32Array(N * 3);
  const tg = new T.BufferGeometry();
  tg.setAttribute('position', new T.BufferAttribute(trail, 3));
  scene.add(new T.Points(tg, new T.PointsMaterial({ color: 0x22c55e, size: sp.trail, transparent: true, opacity: 0.8 })));
  const ring = add(new T.Mesh(new T.RingGeometry(sp.r * 3, sp.r * 3.6, 40), basic(0x22c55e, 0.01)), 0, 0.01, 0);
  ring.rotation.x = -Math.PI / 2;
  // Dust in the light of the hall.
  const dust = new Float32Array(300 * 3);
  for (let i = 0; i < 300; i += 1) { dust[i * 3] = rnd(-1, 1) * sp.W; dust[i * 3 + 1] = rnd(0, camH * 1.1); dust[i * 3 + 2] = rnd(-1, 1) * sp.L * 0.9; }
  const dg = new T.BufferGeometry();
  dg.setAttribute('position', new T.BufferAttribute(dust, 3));
  const dustPts = new T.Points(dg, new T.PointsMaterial({ color: 0xffffff, size: camR / 500, transparent: true, opacity: 0.35 }));
  scene.add(dustPts);

  // The rally: a queue of flights, each from where the last one ended.
  let side = 1; // the side the ball goes to next (+z: near the camera)
  let at = V(0, 1, -sp.L / 3);
  const queue = [];
  const fly = (to, peak, dur) => queue.push({ to, peak, dur });
  const more = () => {
    const s = side;
    if (sp.bounce) {
      // Over the net to bounce on the other side, then up to the player there.
      const b = sp.bounce; const fy = b.floorY ?? sp.r; const xw = b.x ?? sp.W / 2 * 0.85;
      const land = V(rnd(-xw, xw), fy, s * rnd(b.land[0], b.land[1]));
      fly(land, Math.max(b.netY + 0.25, rnd(b.peak[0], b.peak[1])), rnd(b.dur[0], b.dur[1]));
      if (b.wall && Math.random() < 0.35) {
        // Padel: off the back glass first.
        fly(V(land.x * 0.8, rnd(1, 2.2), s * b.wall), 2.6, 0.45);
        fly(V(rnd(-xw, xw), b.hitY, s * rnd(6.5, 8)), 2.4, 0.5);
      } else {
        fly(V(rnd(-xw, xw), b.hitY, s * rnd(b.hit[0], b.hit[1])), b.hitY + (b.floorY ? 0.12 : 0.6), rnd(0.3, 0.45));
      }
    } else if (sp.squash) {
      // To the front wall, a bounce on the floor, back to the player.
      fly(V(rnd(-2.6, 2.6), rnd(0.8, 3.4), -4.86), 3.6, rnd(0.4, 0.55));
      fly(V(rnd(-2.8, 2.8), sp.r, rnd(0.5, 3.5)), rnd(1.8, 3.2), rnd(0.6, 0.8));
      fly(V(rnd(-2.6, 2.6), 0.6, rnd(2.5, 4.3)), 1.2, 0.35);
    } else if (sp.volley) {
      // Bump, set, spike: three touches on one side, then over the net.
      fly(V(rnd(-3, 3), 1.2, -s * rnd(3, 6)), rnd(4.5, 6), 1.3);
      fly(V(rnd(-1.5, 1.5), 2.8, -s * 1.2), 4.8, 1.1);
      fly(V(rnd(-3.5, 3.5), 0.9, s * rnd(3, 7.5)), 3.2, 0.7);
    } else if (sp.hoops) {
      // A shot at the far hoop, through the ring, then a pass to a shooter at the other end.
      const hz = -s * (14 - 1.575);
      fly(V(0, 3.15, hz), rnd(4.6, 5.6), 1.15);
      fly(V(rnd(-0.3, 0.3), sp.r, hz + s * 0.3), 3.2, 0.45);
      fly(V(rnd(-6, 6), 2.2, s * rnd(4, 9)), rnd(2.6, 3.4), 1.0);
    } else if (sp.pitch) {
      // Passes along the ground, sometimes a long ball, now and then a shot at goal (rugby: a kick
      // between the posts). Football's numbers are the defaults.
      const P = sp.pitch === true ? {} : sp.pitch;
      const gz = P.goalZ ?? 52.4, gw = P.goalW ?? 3, gh = P.goalH ?? [0.3, 2.2], lh = P.loftH ?? [8, 14], sp0 = P.speed ?? 17;
      const goal = Math.random() < (P.shot ?? 0.12);
      const to = goal ? (P.posts ? V(rnd(-2.4, 2.4), rnd(4, 9), s * gz) : V(rnd(-gw, gw), rnd(gh[0], gh[1]), s * gz))
        : V(rnd(-(P.xr ?? 30), P.xr ?? 30), sp.r, rnd(-(P.zr ?? 45), P.zr ?? 45));
      const far = at.distanceTo(to);
      const lofted = !goal && Math.random() < 0.3;
      fly(to, goal ? (P.posts ? rnd(12, 18) : rnd(1.5, 3)) : lofted ? rnd(lh[0], lh[1]) : sp.r, goal ? (P.posts ? 1.6 : 0.9) : Math.max(0.8, far / (lofted ? sp0 * 1.3 : sp0)));
      if (goal) { const b = P.back ?? [10, 30], bx = P.backX ?? 20; fly(V(rnd(-bx, bx), sp.r, s * rnd(b[0], b[1])), P.posts ? 8 : 10, 2); }
    } else {
      // Badminton: clears and drops, now and then a smash.
      const smash = Math.random() < 0.3;
      fly(V(rnd(-2.6, 2.6), smash ? 0.25 : 1.1, s * rnd(1.4, 6.2)), smash ? rnd(2.4, 3.2) : rnd(4.2, 6.5), smash ? rnd(0.55, 0.75) : rnd(1.15, 1.6));
    }
    side = -side;
  };
  let cur = null;
  let t0 = 0;
  const next = (now) => {
    if (!queue.length) more();
    const f = queue.shift();
    cur = { from: at.clone(), ...f };
    t0 = now;
    ring.position.set(at.x, (sp.bounce?.floorY ?? 0) + 0.01, at.z);
    ring.material.opacity = 0.9; ring.scale.set(1, 1, 1);
  };
  const pos = (u) => {
    const { from, to, peak } = cur;
    const p = from.clone().lerp(to, u);
    const top = Math.max(peak, from.y, to.y);
    p.y = from.y + (to.y - from.y) * u + 4 * (top - Math.max(from.y, to.y)) * u * (1 - u);
    return p;
  };
  const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let filled = false;
  const frame = (ms) => {
    raf = 0;
    if (stopped) return;
    const now = ms / 1000;
    if (!cur) next(now);
    const w = el.clientWidth; const h = el.clientHeight;
    if (el.width !== Math.floor(w * renderer.getPixelRatio()) || el.height !== Math.floor(h * renderer.getPixelRatio())) {
      renderer.setSize(w, h, false);
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
    }
    let u = (now - t0) / cur.dur;
    if (u >= 1 || u < 0) { at = cur.to.clone(); next(now); u = 0; }
    const p = pos(u); const q = pos(Math.min(1, u + 0.02));
    ball.position.copy(p);
    const dir = q.clone().sub(p);
    if (sp.ball === 'shuttle' && dir.lengthSq() > 1e-8) ball.quaternion.setFromUnitVectors(V(0, -1, 0), dir.normalize());
    if (sp.ball === 'oval' && dir.lengthSq() > 1e-8) ball.quaternion.setFromUnitVectors(V(0, 0, 1), dir.normalize());
    trail.copyWithin(3, 0, (N - 1) * 3);
    trail[0] = p.x; trail[1] = p.y; trail[2] = p.z;
    if (!filled) { for (let i = 1; i < N; i += 1) { trail[i * 3] = p.x; trail[i * 3 + 1] = p.y; trail[i * 3 + 2] = p.z; } filled = true; }
    tg.attributes.position.needsUpdate = true;
    ring.material.opacity *= 0.94; ring.scale.multiplyScalar(1.03);
    dustPts.rotation.y = now * 0.01;
    // The camera drifts behind one end, high in the stands, looking down the court.
    const a = Math.sin(now * 0.08) * 0.35;
    camera.position.set(Math.sin(a) * camR, camH + Math.sin(now * 0.11) * camH * 0.08, Math.cos(a) * camR);
    camera.lookAt(0, lookY, 0);
    // On a wide screen the court sits to the right of the words.
    camera.setViewOffset(w, h, w > 900 ? -w * 0.18 : 0, 0, w, h);
    renderer.render(scene, camera);
    if (!still && visible) raf = requestAnimationFrame(frame);
  };
  // Only drawn while the top of the page is on screen.
  const seen = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !raf && !still) raf = requestAnimationFrame(frame);
  });
  seen.observe(el);
  raf = requestAnimationFrame(frame);
  if (still) window.addEventListener('resize', () => { if (!raf) raf = requestAnimationFrame(frame); });
  return () => { stopped = true; seen.disconnect(); if (raf) cancelAnimationFrame(raf); renderer.dispose(); };
}
