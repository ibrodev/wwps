export default function MethodAndData() {

    return (
        <article className="
            [&_p]:leading[1.7] 

            [&_p]:text-sm
            [&_p]:text-justify
            [&_p]:mb-2

            [&_h1]:leading[1.3] 
            [&_h1]:text-lg 
            [&_h1]:font-semibold 
            [&_h1]:text-eiar-green 
            
            [&_h2]:leading[1.3]
            [&_h2]:font-semibold 
            [&_h2]:text-md
            [&_h2]:my-1
            [&_h2]:text-eiar-green 

            [&_h3]:leading[1.3]
            [&_h3]:font-sm
            [&_h3]:font-semibold
            [&_h3]:text-eiar-green

            [&_strong]:font-semibold
        ">

            <header>
                <h2>1. Method & data</h2>
                <p>
                    The Wheat Water Productivity Estimation Tool is designed to estimate wheat yield and crop water productivity 
                    using satellite-derived crop productivity data and seasonal water consumption. By integrating FAO WaPOR 
                    (Water Productivity through Open access of Remotely sensed derived data) net primary production (NPP) 
                    with crop-specific parameters, the tool estimates crop biomass, harvested yield, and water productivity. 
                    It provides valuable insights into wheat production and water-use efficiency, supporting irrigation 
                    performance assessment, agricultural water management, and informed decision-making for sustainable 
                    wheat production.
                </p>
            </header>

            <section>
               <p>
                    <strong>Crop yield (Y)</strong> is the quantity of harvested crop
                    produced per unit of cultivated land area, typically expressed
                    in kilograms per hectare (kg/ha).
                </p>
                <p>
                    <strong>Crop water productivity (CWP)</strong> measures the quantity
                    of harvested crop produced per unit volume of water consumed,
                    typically expressed in kilograms per cubic metre (kg/m³).
                </p>
            </section>

            <section>

                <h2>2. Mathematical Formulation</h2>
                <h3>2.1. Total Biomass (TB)</h3>
                <p>
                    Total crop biomass is estimated from seasonal net primary production:
                </p>

                <div className=" my-4 p-4 bg-gray-100 rounded-sm overflow-x-auto text-center text-lg">
                    <math display="block" className="font-mono">
                    <mrow>
                        <mi>TB</mi>
                        <mo>=</mo>
                        <mi>AOT</mi>
                        <mo>&#xD7;</mo>
                        <msub><mi>f</mi><mi>c</mi></msub>
                        <mo>&#xD7;</mo>
                        <mfrac>
                        <mrow>
                            <mi>NPP</mi>
                            <mo>&#xD7;</mo>
                            <mn>22.222</mn>
                        </mrow>
                        <mrow>
                            <mn>1</mn>
                            <mo>&#x2212;</mo>
                            <msub><mi>m</mi><mi>c</mi></msub>
                        </mrow>
                        </mfrac>
                    </mrow>
                    </math>
                </div>

                <h3>2.2. Crop Yield (Y)</h3>
                <p>
                    Harvestable crop yield is calculated using total biomass and
                    the harvest index:
                </p>

                <div className=" my-4 p-4 bg-gray-100 rounded-sm overflow-x-auto text-center text-lg">
                    <math display="block" className="font-mono">
                    <mrow>
                        <mi>Y</mi>
                        <mo>=</mo>
                        <mi>TB</mi>
                        <mo>&#xD7;</mo>
                        <msub><mi>h</mi><mi>i</mi></msub>
                    </mrow>
                    </math>
                </div>

                <h3>2.3. Crop Water Productivity (CWP)</h3>
                <p>
                    Crop water productivity is the ratio of estimated crop yield
                    to seasonal water consumption:
                </p>

                <div className=" my-4 p-4 bg-gray-100 rounded-sm overflow-x-auto text-center text-lg">
                    <math display="block" className="font-mono">
                    <mrow>
                        <mi>CWP</mi>
                        <mo>=</mo>
                        <mfrac>
                        <mi>Y</mi>
                        <mi>SWC</mi>
                        </mfrac>
                    </mrow>
                    </math>
                </div>

            </section>

            <section>
                <h2>3. Definition of Variables and Parameters</h2>
                <ul className="[&_li]:mb-2.5 ml-6 list-disc">
                    <li>
                    <strong>TB:</strong> Total crop biomass (kg/ha).
                    </li>
                    <li>
                    <strong>AOT:</strong> Ratio of above ground over total biomass.
                    </li>
                    <li>
                    <strong>f<sub>c</sub>:</strong>
                    Light-use efficiency correction factor.
                    </li>
                    <li>
                    <strong>NPP:</strong>
                    Seasonal net primary production derived from WaPOR
                    data (gC/m²/season).
                    </li>
                    <li>
                    <strong>m<sub>c</sub>:</strong>
                    Moisture content of fresh biomass, expressed as a fraction
                    between 0 and 1.
                    </li>
                    <li>
                    <strong>h<sub>i</sub>:</strong>
                    Harvest index, representing the proportion of biomass that is harvested as grain.
                    </li>
                    <li>
                    <strong>Y:</strong> Estimated crop yield (kg/ha).
                    </li>
                    <li>
                    <strong>CWP:</strong> Crop water productivity (kg/m³).
                    </li>
                    <li>
                    <strong>SWC:</strong>
                    Seasonal water consumption (m³/ha), when yield is expressed
                    in kg/ha and CWP is expressed in kg/m³.
                    </li>
                </ul>

                <p className="py-3 px-4 bg-gray-100 rounded-sm">
                    <strong>Unit consistency:</strong>
                The factor 22.222 is a conversion coefficient used in the biomass estimation equation..
                </p>
            </section>

            <section>
                <h2>4. Estimation Methodology</h2>
                <ol className="[&_li]:mb-2.5 ml-6 list-decimal">
                    <li>
                    <strong>Estimate total biomass.</strong>
                    Convert seasonal WaPOR NPP into total crop biomass using
                    AOT, the light-use efficiency correction factor, biomass
                    moisture content, and the conversion coefficient.
                    </li>
                    <li>
                    <strong>Estimate crop yield.</strong>
                    Multiply total biomass by the harvest index to estimate
                    the harvested crop component. Ensure the harvest index
                    is defined consistently with the biomass quantity used.
                    </li>
                    <li>
                    <strong>Calculate crop water productivity.</strong>
                    Divide estimated crop yield by seasonal water consumption.
                    When yield is expressed in kg/ha, use water consumption
                    in m³/ha to obtain CWP in kg/m³.
                    </li>
                </ol>
            </section>

            <section>
                <h2>5. Interpretation and Applications</h2>
                <p>
                    Crop yield indicates the quantity of crop produced per unit
                    of cultivated land, while crop water productivity indicates
                    the quantity produced per unit volume of water consumed.
                    Together, these indicators support the evaluation of agricultural
                    productivity and water-use efficiency.
                </p>
                <p>
                    The approach can be used to compare crop performance across
                    fields and growing seasons, assess irrigation performance,
                    monitor production, and identify opportunities to improve
                    agricultural water productivity.
                </p>
            </section>

            <section>
                <h2>6. Crop parameter assumptions</h2>
                <p>The wheat parameters — AOT = 0.85 (above-ground/total biomass), fc = 0.90 
                (light-use efficiency correction factor), mc = 0.15 (moisture content of fresh 
                crop biomass ), hi = 0.48 (harvest index) — are general FAO reference values, 
                used as default. Crop growth varies with agro-ecological zone, climate, soils, 
                variety and management, so locally developed EIAR parameters and field observations 
                should replace them where available to improve the accuracy and credibility of the estimates.
                </p>
            </section>

            <section>
                <h2>7. Input validation</h2>
                <p>Before estimation, all mandatory fields are validated to ensure data quality and consistency. 
                These include ID, which must be a unique integer; SOS (start of season) and EOS (end of season), 
                which must be valid dates with EOS occurring after SOS; geometry, which must be a valid point or 
                polygon in the WGS 84 coordinate reference system; and Location for point features, which links 
                each sample to its corresponding plot. Records that fail any validation check are flagged and 
                must be corrected before the analysis can proceed.
                </p>
            </section>

            <section>
                <h2>8. Limitations of the Validation Dataset</h2>
                <p> 
                    The dataset used to validate the Wheat Water Productivity (WWP) estimation tool was compiled 
                    from four irrigation schemes in Ethiopia. Although these data provide a valuable basis for 
                    assessing the tool's performance under the conditions represented by the selected schemes, 
                    the geographical coverage and number of observations are not sufficient to fully capture 
                    the diversity of Ethiopia's agro-ecological conditions. Variations in climate, elevation, 
                    soil properties, irrigation practices, wheat varieties, crop management, and seasonal water 
                    availability across the country may influence crop growth, yield, and water productivity, 
                    potentially affecting the accuracy and transferability of the tool's estimates.
                </p>

                <p>
                    To strengthen the validation process, additional field observations are required from a wider range 
                    of irrigation schemes and agro-ecological zones across Ethiopia. These observations should include 
                    reliable measurements of wheat yield, seasonal water consumption, crop growth parameters, 
                    and relevant environmental and management variables. Where possible, field measurements 
                    should cover multiple growing seasons to account for interannual variability in weather 
                    conditions and agricultural practices.
                </p>
	
                <p>
                    Expanding the validation dataset would enable a more comprehensive evaluation of the tool's 
                    accuracy, reliability, and applicability under different production conditions. It would also 
                    help identify areas where the estimation methodology or crop-specific parameters require 
                    calibration or refinement. Ultimately, a more geographically representative and sufficiently 
                    large validation dataset is essential for improving confidence in the WWP tool and supporting 
                    its wider application in irrigation performance assessment, agricultural water management, 
                    and sustainable wheat production across Ethiopia.
                </p>
            </section>

        </article>
    )
   
}