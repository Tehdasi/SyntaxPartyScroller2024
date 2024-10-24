#version 300 es
precision mediump float;

out vec4 outColor;
uniform vec2 iResolution;
uniform float iTime;
uniform float brown;

uniform int effect1;
uniform int effect2;
uniform float effectCrossfade;
uniform int effectCrossfadeType;

#define PI 3.14159265


mat4 identityMatrix()
{
        return mat4(
        1., 0., 0.,0.,
        0., 1., 0., 0.,
        0., 0., 1., 0.,
        0., 0., 0., 1.
    );
}

mat4 axisRotationMatrix(vec3 axis, float angle) {
  axis = normalize(axis);
  float s = sin(angle);
  float c = cos(angle);
  float oc = 1.0 - c;

  return mat4(
    oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
    oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
    oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
    0.0,                                0.0,                                0.0,                                1.0
  );
}

mat4 translationMatrix(float x, float y, float z) 
{
    return mat4(
        1., 0., 0.,x,
        0., 1., 0., y,
        0., 0., 1., z,
        0., 0., 0., 1.
    );
}



vec3 palette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d )
{
    return a + b*cos( 6.28318*(c*t+d) );
}


float fade(float t) 
{
    return t*t*t*(t*(6.0*t-15.0)+10.0); 
}

float hash13(vec3 p3)
{
	p3  = fract(p3 * .1031);
    p3 += dot(p3, p3.zyx + 31.32);
    return fract((p3.x + p3.y) * p3.z);
}


float grad3D(float hash, vec3 pos) 
{
    int h = int(1e4*hash) & 15;
	float u = h<8 ? pos.x : pos.y,
 		  v = h<4 ? pos.y : h==12||h==14 ? pos.x : pos.z;
    return ((h&1) == 0 ? u : -u) + ((h&2) == 0 ? v : -v);
}

float perlinNoise3D(vec3 pos)
{
	vec3 pi = floor(pos); 
    vec3 pf = pos - pi;
    
    float u = fade(pf.x);
    float v = fade(pf.y);
    float w = fade(pf.z);
    
    return mix( mix( mix( grad3D(hash13(pi + vec3(0, 0, 0)), pf - vec3(0, 0, 0)),
                           grad3D(hash13(pi + vec3(1, 0, 0)), pf - vec3(1, 0, 0)), u ),
            	      mix( grad3D(hash13(pi + vec3(0, 1, 0)), pf - vec3(0, 1, 0)), 
                	 	   grad3D(hash13(pi + vec3(1, 1, 0)), pf - vec3(1, 1, 0)), u ), v ),
        		 mix( mix( grad3D(hash13(pi + vec3(0, 0, 1)), pf - vec3(0, 0, 1)), 
                		   grad3D(hash13(pi + vec3(1, 0, 1)), pf - vec3(1, 0, 1)), u ),
            		  mix( grad3D(hash13(pi + vec3(0, 1, 1)), pf - vec3(0, 1, 1)), 
                		   grad3D(hash13(pi + vec3(1, 1, 1)), pf - vec3(1, 1, 1)), u ), v ), w );
}




vec3 domat(vec3 loc, float iTime) 
{
    float col= 0.;
    float d= 1.;
    
    for( int i= 0; i< 7; i++ )
    {
        col+= perlinNoise3D(loc*d  + vec3(0,0,-iTime*2.))/d;
        d*= 2.;
    }
    

// 7f6050
//   return vec3(col/6.+ 0.15);
   
   return palette(col*0.4 + iTime, vec3(0.5, 0.5, 0.5), vec3(0.5, 0.5, 0.5), vec3(1.0, 0.7, 0.4), vec3(0.00, 0.15, 0.20) )*0.6;    
}


vec2 grad( ivec2 z )  // replace this anything that returns a random vector
{
    // 2D to 1D  (feel free to replace by some other)
    int n = z.x+z.y*11111;

    // Hugo Elias hash (feel free to replace by another one)
    n = (n<<13)^n;
    n = (n*(n*n*15731+789221)+1376312589)>>16;

#if 0

    // simple random vectors
    return vec2(cos(float(n)),sin(float(n)));
    
#else

    // Perlin style vectors
    n &= 7;
    vec2 gr = vec2(n&1,n>>1)*2.0-1.0;
    return ( n>=6 ) ? vec2(0.0,gr.x) : 
           ( n>=4 ) ? vec2(gr.x,0.0) :
                              gr;
#endif                              
}


float noise( in vec2 p )
{
    ivec2 i = ivec2(floor( p ));
     vec2 f =       fract( p );
	
	vec2 u = f*f*(3.0-2.0*f); // feel free to replace by a quintic smoothstep instead

    return mix( mix( dot( grad( i+ivec2(0,0) ), f-vec2(0.0,0.0) ), 
                     dot( grad( i+ivec2(1,0) ), f-vec2(1.0,0.0) ), u.x),
                mix( dot( grad( i+ivec2(0,1) ), f-vec2(0.0,1.0) ), 
                     dot( grad( i+ivec2(1,1) ), f-vec2(1.0,1.0) ), u.x), u.y);
}


float mn(in vec2 p, float tm) {

    vec2 aPos = vec2(tm);
    vec2 aScale = vec2(1.);
    float a = noise(p * aScale + aPos);

    vec2 bPos = vec2(-tm, 0.) * 1.;
    vec2 bScale = vec2(1.5);
    float b = noise((p + a) * bScale + bPos);

    vec2 cPos = vec2(0., -tm ) * 2.;
    vec2 cScale = vec2(1.);
    float c = noise((p + b) * cScale + cPos);

    return c;
}


float sdBox( vec3 p, vec3 b )
{
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}    


float opLimitedRepetition( in vec3 p, in float s, in vec3 l )
{
    vec3 q = p - s*clamp(round(p/s),-l,l);
    return sdBox( p, q );
}

//------------------------------------------------------------------------
// SDF sculpting
//
// Thsi is the SDF function F that defines the shapes, in this case a sphere
// of radius 1. More info: https://iquilezles.org/articles/distfunctions/
//------------------------------------------------------------------------
float doModel( vec3 p, float tm )
{
    mat4 rm= identityMatrix();
    
    rm*= axisRotationMatrix( vec3(0.2,0.3,0.5), tm*0.5);
//    rm*= axisRotationMatrix( vec3(0.2,0.8,0.1), iTime*0.5);
    rm*=  translationMatrix( 0.,sin(tm)*10.0,0.  );
    
    p+= vec3(3.,0.,0.);

    vec4 pr= rm*vec4(p,1);
    
    // comment this line in order to try the fun SDF below
//    return length(p) - 1.0;
//    return min( min( length(p.xyz)-1.0, length(p.xy)-0.2 ),
//                min( length(p.yz )-0.2, length(p.zx)-0.2 ) );

    return sdBox( pr.xyz, vec3(1.,1.,1.));
}


//------------------------------------------------------------------------
// Material 
//
// Defines the material (colors, shading, pattern, texturing) of the model
// at every point based on its position and normal. In this case, it simply
// returns a constant yellow color.
//------------------------------------------------------------------------
vec3 doMaterial( in vec3 pos, in vec3 nor )
{
//    return vec3(0.2,0.07,0.01);
    return domat( pos, iTime );
}

//------------------------------------------------------------------------
// Lighting
//------------------------------------------------------------------------

vec3 doLighting( in vec3 pos, in vec3 nor, in vec3 rd, in float dis, in vec3 mal )
{
    vec3 lin = vec3(0.0);

    // key light
    //-----------------------------
    vec3  lig = normalize(vec3(1.0,0.7,0.2));
    float dif = max(dot(nor,lig),0.0);
    lin += dif*vec3(4.00,4.00,4.00);

    // ambient light
    //-----------------------------
    lin += vec3(0.7);

    
    // surface-light interacion
    //-----------------------------
    vec3 col = mal*lin;

    
    // fog    
    //-----------------------------
	col *= exp(-0.01*dis*dis);

    return col;
}

//------------------------------------------------------------------------
// Camera
//
// Move the camera. In this case it's using time and the mouse position
// to orbitate the camera around the origin of the world (0,0,0), where
// the yellow sphere is.
//------------------------------------------------------------------------
void doCamera( out vec3 camPos, out vec3 camTar, in float time )
{
    float an = 0.3*iTime;
	camPos = vec3(3.5,0,0);
    camTar = vec3(0.0,0.0,0.0);
}


//=============================================================

// more info: https://iquilezles.org/articles/normalsSDF/
vec3 compute_normal( in vec3 pos, float tm )
{
    const float eps = 0.002;             // precision of the normal computation
    const vec3 v1 = vec3( 1.0,-1.0,-1.0);
    const vec3 v2 = vec3(-1.0,-1.0, 1.0);
    const vec3 v3 = vec3(-1.0, 1.0,-1.0);
    const vec3 v4 = vec3( 1.0, 1.0, 1.0);
	return normalize( v1*doModel( pos + v1*eps, tm ) + 
					  v2*doModel( pos + v2*eps, tm ) + 
					  v3*doModel( pos + v3*eps, tm ) + 
					  v4*doModel( pos + v4*eps, tm ) );
}

float intersect( in vec3 ro, in vec3 rd, float tm )
{
	const float maxd = 20.0;           
    float t = 0.0;
    for( int i=0; i<128; i++ )          // max number of raymarching iterations is 90
    {
	    float d = doModel( ro+rd*t, tm );
        if( d<0.001 || t>maxd ) break;  // precision 0.001, maximum distance 20
        t += d;
    }
    return (t<maxd) ? t : -1.0;
}

vec4 cubeColor( in vec2 uv, float tm )
{
    // camera movement (ro is ray origin, ta is the target location we are looking at)
    vec3 ro, ta; 
    doCamera( ro, ta, iTime );

    // camera matrix
    vec3 ww = normalize( ta - ro );
    vec3 uu = normalize( cross(ww,vec3(0.0,1.0,0.0) ) );
    vec3 vv = normalize( cross(uu,ww));
    mat3 camMat = mat3( uu, vv, ww );
    
	// create ray
	vec3 rd = normalize( camMat * vec3(uv,2.0) ); // 2.0 is the lens length

    // compute background
	vec4 col = vec4(0);

	// project/intersect through raymarching of SDFs
    float t = intersect( ro, rd, tm );
    if( t>-0.5 )
    {
        // geometry
        vec3 pos = ro + t*rd;
        vec3 nor = compute_normal(pos, tm);

        // materials
        vec3 mal = doMaterial( pos, nor );

        // lighting
//        col = mal; 
        col = vec4( doLighting( pos, nor, rd, t, mal ), 1);
	}

    // monitor gamma adjustnment
//	col = pow( clamp(col,0.0,1.0), vec3(0.4545) );
	   
    return col;
}

vec4 cube2Color( in vec2 uv, float tm )
{
    float ul= length(uv);

    vec2 uuv= uv*(sin(ul*8. - (tm*2.))+1.);

    float alpha=  min(1.,1./(ul*8.+0.01));
    
    return vec4( cubeColor(uuv, tm).rgb,  alpha  );
}

vec4 cube3Color( in vec2 uv, float tm )
{
    return vec4( cubeColor(uv/4., tm).rgb,  0.33 );
}

vec4 cube4Color( in vec2 uv, float tm )
{
    vec4 col= vec4(0.);
    for( float i= 0.; i< 4.; i++ )
    {
        float sz= pow(2.,i+1.)/4.;

        vec4 nc= cubeColor(uv*sz, tm+i*0.4);

        if( nc.a > 0.)
            col= vec4(nc.rgb,sz*0.5  );
    }

    return col;
}

vec4 cube5Color( in vec2 uv, float tm )
{
    vec4 nc= cubeColor(uv, tm);

    float c= (nc.r + nc.g + nc.b)/3.;

    return vec4(c,c,c,nc.a);
}

vec4 cube6Color( in vec2 uv, float tm )
{
    return cubeColor(uv, tm - uv.y*4. );
}

vec4 cube7Color( in vec2 uv, float tm )
{
    float a=floor(uv.x*4.);


    return cubeColor(uv, tm+a );
}

vec4 getEffectColor(int effect, vec2 uv )
{
    switch( effect )
    {
        case 0: return vec4( 0,0,0,0 );
        case 1: return cubeColor(uv + vec2(1.3,0.), iTime );
        case 2: return cube2Color(uv + vec2(1.3,0.),  iTime );
        case 3: return cube3Color(uv + vec2(1.3,0.),  iTime );
        case 4: return cube4Color(uv + vec2(1.3,0.),  iTime );
        case 5: return cube5Color(uv + vec2(1.3,0.),  iTime );
        case 6: return cube6Color(uv + vec2(1.3,0.),  iTime );
        case 7: return cube7Color(uv + vec2(1.3,0.),  iTime );
    }
    return vec4(1,0,1,1);
}


bool wavyCircleFade(vec2 uv, vec2 centre, float f)
{
    vec2 del= uv-centre;
    float d= length(del);
    float a= atan( del.y, del.x );
    d= d*(1. + sin(a*8.)*0.3);
    
    return !(mod(d,0.25) > f*0.25);
}

bool squareFade( vec2 uv, float f )
{
    float w= 0.2;
    vec2 uuv= vec2( mod(uv.x,w)-w/2., mod(uv.y,w)-w/2. );
    
    return max(abs(uuv.x), abs(uuv.y)) < f*0.2;
}

bool horizontalFade( vec2 uv, float f )
{
    float w= 0.2;
    float uuv= mod(uv.y,w)-w/2.;
    
    return abs(uuv) < f*0.2;
}

bool verticalFade( vec2 uv, float f )
{
    float w= 0.2;
    float uuv= mod(uv.x,w)-w/2.;
    
    return abs(uuv) < f*0.2;
}

float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

bool randomFade( vec2 uv, float f )
{
    
    return ( rand(uv) < f );
}

bool manyCircleFade(vec2 uv, float f)
{
    vec2 uuv= vec2( mod(uv.x,0.2), mod(uv.y,0.2) );
    
    return length( uuv-vec2(0.1,0.1) ) < f*0.1*sqrt(2.);
}

bool checkCircleFade(vec2 uv, vec2 centre, float f)
{
    float spikes= 16.;

    vec2 del= uv-centre;
    float d= log(length(del))*.1;
    float a= atan( del.y, del.x );
    
    return !((mod(d,0.05) > f*0.05) || (mod(a,2.*PI/spikes) > f*(2.*PI/spikes)));
}

bool rotateFade(vec2 uv, vec2 centre, float f)
{
    float spikes= 2.;
    
    vec2 d= uv-centre;
    float a= atan( d.y, d.x );
    
    return !(mod(a,2.*PI/spikes) > f*(2.*PI/spikes));
}

void main() 
{
    vec2 uv = (2.0*gl_FragCoord.xy-iResolution.xy)/iResolution.y;
//   vec2 uv= gl_FragCoord.xy/iResolution.x;
    float col= mn(uv *2. + vec2( 0, -iTime*0.05 ), iTime*0.1);

    vec2 effectCentre= vec2( -1.3,0.);

    float  d= distance( vec2(0.15,0.25), uv );

//    col+= d*2. + -iTime;


    col= col*0.5 + 0.2;
    vec3 plasma= vec3(col*0.9,col*1.1,col*1.3);


    // if( d > 0.1 && d < 0.3   )
    //     plasma= vec3(0,0,0);


   vec3 plasColor= mix( plasma, vec3(0.5,0.4,0.3), brown );



   bool effect;
    if( effectCrossfadeType == 1 ) { effect=  randomFade(uv,effectCrossfade); }
    else if( effectCrossfadeType== 2 ){ effect= wavyCircleFade( uv, effectCentre, effectCrossfade  ); }
    else if( effectCrossfadeType== 3 ){ effect= squareFade(uv,effectCrossfade); }
    else if( effectCrossfadeType== 4 ){ effect= horizontalFade(uv,effectCrossfade); }
    else if( effectCrossfadeType== 5 ){ effect= verticalFade(uv,effectCrossfade); }
    else if( effectCrossfadeType== 6 ){ effect= manyCircleFade(uv, effectCrossfade); }
    else if( effectCrossfadeType== 7 ){ effect= checkCircleFade(uv, effectCentre, effectCrossfade); }
    else if( effectCrossfadeType== 8 ){ effect= rotateFade(uv, effectCentre, effectCrossfade); }


    vec4 effectColor;


    if( effect  )
        effectColor= getEffectColor(effect1,uv);
    else 
        effectColor= getEffectColor(effect2,uv);

//    effectColor= ;
    outColor= vec4( mix( plasColor, effectColor.rgb, effectColor.a ),1 ); 

//     if( effectColor.w > 0. )
//         outColor= effectColor;
//     else
//         outColor= vec4(plasColor,1.);
}