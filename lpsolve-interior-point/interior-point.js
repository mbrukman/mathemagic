//https://www.d3indepth.com/shapes/
//LIBRARY: Promises
function promiseDuration(dt) {
    return new Promise((resolve) => { setTimeout(() => resolve(), dt); });
}

//LIBRARY:LINALG

const EPS = 1e-4;
// solve p1 x + q1 y = b1 | p2 x + q2 y = b2
function matvec(m, v) {
    return [m[0][0] * v[0] + m[0][1] * v[1], m[1][0] *v[0] + m[1][1] * v[1]]
}

function det(m) {
    return m[0][0] * m[1][1] - m[1][0] * m[0][1];
}

function inv(m) {
    var d = det(m);
    console.assert(Math.abs(d) > EPS);
    return [[m[1][1]/d, -m[0][1]/d], [-m[1][0]/d, m[0][0]/d]];
}

function matmat(m1, m2) {
    m3 = [[0, 0], [0, 0]]
    for(var i = 0; i < 2; ++i) {
        for(var j = 0; j < 2; ++j) {
            for(var k = 0; k < 2; ++k) {
                m3[i][k] += m1[i][j] * m2[j][k];
            }
        }
    }
    return m3;
}

// solve (p1x + q1 y = b1 | p2x + q2y = b2)
function solve2d(p1, q1, b1, p2, q2, b2) {
    return matvec(inv([[p1, q1], [p2, q2]]), [b1, b2])
}

// convert pair of points (pt1, pt2) into [[p, q], b] for line eqn px + qy = b
function points2line(pt1, pt2) {
    // (y - y1) = (y2-y1)/(x2-x1) * (x - x1)
    // (y - y1) (x2 - x1) = (y2 - y1) (x - x1)
    // y (x2 - x1) - (y2 - y1) x = y1(x2 - x1) - x1 (y2 - y1)
    // y δx - x δy = y1 δx - x1 δy | TODO: think about this properly.
    delta = [pt2[1] - pt1[1], pt2[0] - pt1[0]]
    return [delta[1], delta[0], pt1[1] * delta[0] - pt1[0] * delta[1]];
}

function centroid(xs) {
    var c = [0, 0];
    for(var i = 0; i < xs.length; ++i) { c[0] += xs[i][0]; c[1] += xs[i][1]; }
    return [c[0] / xs.length, c[1] / xs.length];
}

// create (nx, ny) dots positioned at (x0 + dx * i, y0 + dy * j)
function grid(x0, y0, dx, dy, nx, ny) {
    var data = []
    for (var i = 0; i < nx; ++i) {
        for(var j = 0; j < ny; ++j) {
            data.push([x0 + dx*i, y0 + dy*j]);
        }
    }
    return data;

}

// evaluate the log-barrier of a polygon defined by polypts with current
// point being ptcur.
function logbarrier(polypts, ptcur) {
    var sum = 0;
    for(var i = 0; i < polypts.length - 1; i++) {
        var line = points2line(polypts[i], polypts[i+1]);
        return Math.log(line[0][0] * ptcur[0] + line[0][1] * ptcur[1] - line[1]);
    }

    return sum;
}

function make_anim1_gen(container, points) {

    const width = 500;
    const height = 200;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", width + "px");
    svg.setAttribute("height", height + "px");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`)
    svg.setAttribute("font-family", "monospace");
    
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cy", 100);
    circle.setAttribute("fill", "#1a73e8");
    svg.appendChild(circle);
    container.appendChild(svg);
    return (async function*() {

        const DT = 1.0/60.0;
        while(true) {
            for(var i = 0; i < 2000; ++i) {
                const anim = anim_circle({}, i  / 2000.0);
                circle.setAttribute("cx", anim.cx);
                circle.setAttribute("r", anim.cr);
                await promiseDuration(DT);
                yield;
            }
            await promiseDuration(100); yield;
        }
    })();
}

function make_anim2_gen(container, points) {

    const width = 500;
    const height = 200;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", width + "px");
    svg.setAttribute("height", height + "px");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`)
    svg.setAttribute("font-family", "monospace");
    
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cy", 100);
    circle.setAttribute("fill", "#1a73e8");
    svg.appendChild(circle);
    container.appendChild(svg);
    return (async function*() {
        const DT = 1.0/60.0;
        while(true) {
            const t = document.getElementById("animation-2-scrubber").value / 1000.0; 
            const anim = anim_circle({},  t);
            console.log("scrubbed to: ", t);

            circle.setAttribute("cx", anim.cx);
            circle.setAttribute("r", anim.cr);
            await promiseDuration(DT);
            yield;
        }
    })();
}


function animator_from_generator(gen) {
    gen.next().then(function() { 
        gen.next().then(animator_from_generator(gen));
    });
}



function init_interior_point() {
    const anim1 = make_anim1_gen(document.getElementById("animation-1"), 
         [[50, 50], [100, 150], [200, 200], [50, 50]]);
    animator_from_generator(anim1);

    const anim2 = make_anim2_gen(document.getElementById("animation-2"), 
         [[50, 50], [100, 150], [200, 200], [50, 50]]);
    animator_from_generator(anim2);
}                      