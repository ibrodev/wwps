export default function MethodAndData () {

    return <div className="[&_h4]:font-semibold [&_h4]:mb-2 [&_h4]:not-first:mt-6 [&_p]:mb-2 [&_p]:mt-2 *:text-sm *:text-justify">

        <h4>Estimation approach</h4>
        <p>
            Seasonal WaPOR NPP (L2, 100&nbsp;m, dekadal, summed SOS &rarr; EOS) is linked to biomass,
            yield and water use in a simple sequence:
        </p>
      
        <code className="border border-slate-100 bg-slate-50 rounded p-4 text-green-700 flex mb-2">

            TB&nbsp;&nbsp;= (AOT &times; fc &times; NPP &times; 22.222) / (1 &minus; mc)<br/><br/>
            Y&nbsp;&nbsp;&nbsp;= TB &times; hi<br/><br/>
            CWP = Y / SWC

        </code>

        <p>
            where TB is total biomass (kg/ha), NPP the seasonal net primary production
            (gC/m&sup2;/season), Y the yield (kg/ha), CWP the crop water productivity (kg/m&sup3;) and
            SWC the seasonal water consumption (m&sup3;, from WaPOR AETI). Yield measures how
            efficiently land produces wheat; CWP measures how efficiently the consumed water is
            converted into production &mdash; together they support evaluating irrigation
            performance.
        </p>

        <h4>Crop parameter assumptions</h4>

        <p>
            The wheat parameters &mdash; AOT = 0.85 (above-ground/total biomass), fc = 0.90
            (light-use correction), mc = 0.15 (grain moisture), hi = 0.48 (harvest index) &mdash; are
            general FAO reference values. They are defaults: crop growth varies with agro-ecological
            zone, climate, soils, variety and management, so locally developed EIAR parameters and
            field observations should replace them where available to improve the accuracy and
            credibility of the estimates.
        </p>
        
        <h4>Input validation</h4>
        
        <p>
            Before estimation, mandatory fields are checked: <b>ID</b> (unique integer), <b>SOS</b>
            and <b>EOS</b> (valid dates, EOS after SOS), <b>geometry</b> (valid point or polygon in
            WGS&nbsp;84), and <b>Location</b> for point features, which links samples to individual
            plots. Records failing a check are flagged and must be corrected before analysis.
        </p>
        
        <h4>Boundaries and points</h4>
        
        <p>
            Field boundaries and monitoring points are the 2026 irrigated wheat survey layers
            (Amibara, Dubti, Dodota, Godino). Field metrics are the seasonal WaPOR v3 results; point
            results are aggregated to farm plots by median, following the analysis notebook. Custom
            areas added on the map get illustrative estimates until a WaPOR run covers them.
        </p>

        <h4>Caveats in the 2026 survey data</h4>
        
        <p>
            <b>Dubti field 4</b> contains no monitoring points, so nothing checks its estimate
            &mdash; and its seasonal AETI of 194&nbsp;mm is a third below its two neighbours on the
            same season window, consistent with part of the mapped area not having been cropped.
            <b>Dodota</b> mixes seasons: its boundary record runs
            Dec&nbsp;2024&nbsp;&rarr;&nbsp;Apr&nbsp;2025 while one of its two point groups was
            collected a year later, so a boundary-versus-point comparison there is partly a comparison
            between years.
        </p>

        <p>
            At 100&nbsp;m one WaPOR pixel is one hectare, so Godino covers about 4&nbsp;pixels,
            Dodota 7 and Amibara 13. Field outlines are finer than the data can resolve, and a
            whole-field average at that ratio is dominated by edge pixels.
        </p>

    </div>

}