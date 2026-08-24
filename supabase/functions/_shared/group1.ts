// section 5.0 - Site

//sec 5.1

export const topographyStormwater = {
    description: [
        {
            id: 'topography',
            type: 'textarea',
            label: 'Topography',
            rows: 5,
            defaultValue: 'The United States Geological Survey (USGS), (insert Quad name), (state) Quadrangle 7.5 minute series topographic map was reviewed for this ESA. This map was published by the USGS in (insert year). Based on a review of the topographic map, the Subject Property is located on/in a (slope, top of the hill, relatively flat area, slightly hilly area, hilly area) approximately (insert elevation) feet above mean sea level (MSL). The contour lines indicate that the Subject Property is sloping toward the (insert direction north, east, south, west, northeast, northwest, southeast, southwest, north northeast, north northwest, east northeast, east southeast, west northwest, west southwest). A copy of the topographic map of the Subject Property is included in Appendix A.',
            quickOptions: null,
        },
        {
            id: 'surface-water-bodies',
            type: 'textarea',
            label: 'Surface Water Bodies',
            rows: 3,
            defaultValue: 'There are no surface water bodies on or immediately adjacent to the Subject Property.\nOR describe any applicable water body...',
            quickOptions: null,
        },
    ],

    observations: [
        {
            id: 'general-condition',
            type: 'condition-selector',
            label: 'General Condition',
            options: ['Good', 'Fair', 'Poor'],
        },
        {
            id: 'age-lastaction',
            type: 'textarea',
            label: 'Age / Last Action',
            rows: 3,
            defaultValue: 'The topography and storm water drainage components are original and are maintained as part of the routine maintenance of the facility.',
            quickOptions: null,
        },
    ],

    concerns: [
        {
            id: 'signs-of-ponding',
            type: 'textarea',
            label: 'Signs of Ponding',
            rows: 3,
            defaultValue: 'No significant areas of ponding were noted by or reported to NDDS\'s assessor.\nOr describe the area of concern...',
            quickOptions: null,
        },
        {
            id: 'signs-of-erosion',
            type: 'textarea',
            label: 'Signs of Erosion',
            rows: 3,
            defaultValue: 'No significant areas of erosion were noted by or reported to NDDS\'s assessor.\nOr describe the area of concern...',
            quickOptions: null,
        },
        {
            id: 'drainage-issues',
            type: 'textarea',
            label: 'Drainage Issues',
            rows: 3,
            defaultValue: 'No major drainage problems were noted by or reported to NDDS\'s assessor.\nOr describe the drainage issues',
            quickOptions: null,
        },
        {
            id: 'indications-of-wetlands',
            type: 'textarea',
            label: 'Indications of Wetlands',
            rows: 5,
            defaultValue: 'NDDS did not observe any water bodies or vegetation indicative of wetlands on the Subject Property. The majority of the property is covered with the building(s), paved driveways and parking areas, and landscaping. It is unlikely that portions of the Subject Property would be classified as wetlands.\nOr describe the location and size of potential wetland\nNDDS reviewed the US Fish and Wildlife Wetlands map of the Subject Property. No wetlands are depicted on the property Or describe the location and type of wetland. A copy of the wetland map is included in Appendix A.',
            quickOptions: null,
        },
    ],

    recommendations: [
        {
            id: 'recommendations',
            type: 'textarea',
            label: 'Recommendations',
            rows: 4,
            defaultValue: '',
            quickOptions: [
                {
                    label: 'Routine maintenance',
                    text: 'The topography and storm water drainage should be maintained as part of the routine maintenance of the property.',
                },
                {
                    label: 'Potential wetlands identified',
                    text: 'OR Potential wetlands were identified on the property. NDDS recommends that a determination be made regarding whether or not this area would be considered a jurisdictional wetland prior to any development activities likely to impact this area. NDDS was not informed of any planned development activities, so no costs are identified at this time.',
                },
                {
                    label: 'Costs included',
                    text: 'Costs are included in the short term/immediate term of the Deferred Maintenance/Physical Deficiencies Table 1 in Appendix C. OR Costs have been included in the Capital Replacement Reserve Schedule Table 2 in Appendix C.',
                },

            ],
        },
    ],
}

//sec 5.2

export const accessEgress = {
    //description block
    description: [
        {
            id:'accessEgress',
            type:'textarea',
            label:'Access and Egress',
            rows:2,
            defaultValue:'',
            placeholder:'Access and egress to the property is provided by…',
            quickOptions: null,
        },
        {
            id: 'signage',
            type: 'textarea',
            label: 'Signage',
            rows: 2,
            defaultValue: '',
            placeholder:'Describe site signage…',
            quickOptions: null,
        }
    ],

    //observations block
    observations: [
        {
            id:'general-condition',
            type:'condition-selector',
            label:'General Condition',
            options: ['Good', 'Fair', 'Poor'],
        },
        {
            id:'age-lastaction',
            type:'textarea',
            label:'Age / Last Action',
            rows:3,
            defaultValue:'The access and egress to the property is original to the construction of the property. The main signs identifying the property are also original and are maintained as part of the routine maintenance of the facility. ',
            quickOptions: null,
        }

    ],

    //concerns block
    concerns: [
        {
            id:'poor-access-egress',
            type: 'textarea',
            label: 'Poor Access / Egress',
            rows: 3,
            defaultValue: 'No concerns relating to property access or egress were noted by or reported to the NDDS assessor.  ',
            quickOptions: null,
        },
        {
            id:'poor-signage',
            type: 'textarea',
            label: 'Poor Signage',
            rows: 3,
            defaultValue: 'The signage identifying the property was clearly visible from the road.  No concerns regarding the property signage were noted.   ',
            quickOptions: null,
        },
        {
            id:'other-concerns',
            type: 'textarea',
            label: 'Other Concerns',
            rows: 3,
            defaultValue: 'No other concerns relating to access to and egress from the property were noted by or reported to the NDDS assessor. ',
            quickOptions: null,
        }
    ],
    //recommendations block
    recommendations: [
        {
            id:'recommendations',
            type: 'textarea',
            label: 'Recommendations',
            rows: 3,
            defaultValue: 'No actions regarding property signage or changes to the access or egress from the Subject Property are recommended at this time. Site signage should continue to be handled as part of the routine maintenance of the facility. ',
            quickOptions: null,
        }
    ]
}

//sec 5.3

export const pavingCurbingParking = {
    //description block
    description: [
        {
            id:'driveway-parking-areas',
            type:'textarea',
            label:'Driveway / Parking Areas',
            rows:2,
            defaultValue:'',
            placeholder:'Describe the driveways and parking areas including pavement type and number of spaces ',
            quickOptions: null,
        },
        {
            id:'curbing',
            type:'textarea',
            label:'Curbing',
            rows:3,
            defaultValue:'',
            placeholder:'Describe the curbing...',
            quickOptions: [
                {
                    label: 'Pre-formed concrete parking stops',
                    text: 'The curbs consist of pre-formed concrete parking stops. ',
                },
                {
                    label: 'Poured concrete curbs',
                    text: 'Poured concrete curbs are present throughout the driveway and parking areas. ',
                },
            ],
        },
        {
            id:'covered-parking',
            type:'textarea',
            label:'Covered Parking',
            rows:3,
            defaultValue:'',
            placeholder:'Describe the covered parking...',
            quickOptions: [
                {
                    label: 'No covered parking',
                    text: 'No covered parking is provided at the Subject Property. ',
                },
                {
                    label: 'Carports',
                    text: 'Carports, providing a total of ___ covered parking spaces, are provided throughout the property. The carports are of metal post and frame construction with corrugated steel roofing. ',
                },
                {
                    label: 'Garage (precast concrete)',
                    text: 'A four-level garage structure, containing ___ parking spaces, is present. The garage is of reinforced concrete construction with precast concrete beans, columns and twin-tee decking.   ',
                },
                {
                    label: 'Garage (steel/metal deck)',
                    text: 'A four-level garage structure, containing ___ parking spaces, is present.  The parking garage is of reinforced concrete construction with steel columns, beams and joists, with metal decking. The driving surfaces are poured concrete over the metal decking. ',
                },
            ],
        },
        {
            id:'other-parking',
            type:'textarea',
            label:'Other Parking',
            rows:3,
            defaultValue:'No other significant features were present that related to the driveways, parking areas or curbing. ',
            quickOptions: null,
        }
    ],
    //observations block
    observations: [
        {
            id:'general-condition',
            type:'condition-selector',
            label:'General Condition',
            options: ['Good', 'Fair', 'Poor'],
        },
        {
            id:'age-lastaction',
            type:'textarea',
            label:'Age / Last Action',
            rows:3,
            defaultValue:'The access and egress to the property is original to the construction of the property. The main signs identifying the property are also original and are maintained as part of the routine maintenance of the facility.',
            quickOptions: null,
        }
    ],
    //concerns block
    concerns: [
        {
            id:'faded-striping',
            type: 'textarea',
            label: 'Faded Striping',
            rows: 3,
            defaultValue: 'The striping at the property was clearly visible. No concerns were noted.',
            quickOptions: null,
        },
        {
            id:'cracking-alligatoring',
            type: 'textarea',
            label: 'Cracking / Alligatoring',
            rows: 3,
            defaultValue: 'No significant cracking, alligatoring or spalling of the paved areas was noted during the site visit.',
            quickOptions: null,
        },
        {
            id:'depressions-potholes',
            type: 'textarea',
            label: 'Depressions / Potholes',
            rows: 3,
            defaultValue: 'No major depressions or potholes were observed. ',
            quickOptions: null,
        },
        {
            id:'insufficient-parking',
            type: 'textarea',
            label: 'Insufficient Parking',
            rows: 3,
            defaultValue: 'No concerns regarding insufficient parking were reported to the NDDS assessor.  The number of parking spaces appeared adequate at the time of the site visit. ',
            quickOptions: null,
        },
        {
            id:'other-concerns',
            type: 'textarea',
            label: 'Other Concerns',
            rows: 3,
            defaultValue: 'No other concerns relating to the driveways, curbs and parking areas were noted.',
            quickOptions: null,
        }
    ],
    //recommendations block
    recommendations: [
        {
            id:'recommendations',
            type: 'textarea',
            label: 'Recommendations',
            rows: 3,
            defaultValue: 'No actions regarding property signage or changes to the access or egress from the Subject Property are recommended at this time. Site signage should continue to be handled as part of the routine maintenance of the facility. ',
            quickOptions: null,
        }
    ]
}

//sec 5.4

export const flatwork = {
    //description block
    description: [
        {
            id:'sidewalks',
            type:'textarea',
            label:'Sidewalks',
            rows:2,
            defaultValue:'Concrete sidewalks are present at the Subject Property.  The sidewalks consist of standard poured concrete slabs. ',
            quickOptions: null,
        },
        {
            id:'patios-decks',
            type:'textarea',
            label:'Patios / Decks',
            rows:2,
            defaultValue:'No patios or decks are present at the Subject Property. ',
            quickOptions: null,
        },
        {
            id:'other-flatwork',
            type:'textarea',
            label:'Other Flatwork',
            rows:2,
            defaultValue:'No other significant flatwork is present at the property. ',
            quickOptions: null,
        }
    ],
    //observations block
    observations: [
        {
            id:'general-condition',
            type:'condition-selector',
            label:'General Condition',
            options: ['Good', 'Fair', 'Poor'],
        },
        {
            id:'age-lastaction',
            type:'textarea',
            label:'Age / Last Action',
            rows:3,
            defaultValue:'The flatwork at the Subject Property is original and is maintained as part the routine maintenance. ',
            quickOptions: 
            {
                label: 'portion of flatwork repaired or replaced',
                text: 'Portions of the flatwork have been repaired or replaced as needed on an ongoing basis.  No full scale replacement has occurred. ',
            },
        }
    ],

    //concerns block
    concerns: [
        {
            id:'significant-cracking',
            type: 'textarea',
            label: 'Significant Cracking',
            rows: 3,
            defaultValue: 'No significant cracking of the flatwork at the Subject Property was noted during the assessment.',
            quickOptions: null,
        },
        {
            id:'heaving-settlement',
            type: 'textarea',
            label: 'Heaving / Settlement',
            rows: 3,
            defaultValue: 'No significant areas of heaving or settlement were observed during the assessment. ',
            quickOptions: null,
        },
        {
            id:'trip-hazards',
            type: 'textarea',
            label: 'Trip Hazards',
            rows: 3,
            defaultValue: 'No significant trip hazards were noted during the assessment of the property.  ',
            quickOptions: null,
        },
        {
            id:'other-concerns',
            type: 'textarea',
            label: 'Other Concerns',
            rows: 3,
            defaultValue: 'No other significant concern relating to the flatwork at the Subject Property was noted by or reported to the NDDS assessor. ',
            quickOptions: null,
        }
    ],
    //recommendations block
    recommendations: [
        {
            id:'recommendations',
            type: 'textarea',
            label: 'Recommendations',
            rows: 3,
            placeholder:'describe site specific recommendations',
            quickOptions: [
                {
                    label: 'Routine Maintenance',
                    text: 'Concrete flatwork generally has an EUL in excess of 25 years if constructed over a properly stabilized base and maintained regularly.  No areas requiring immediate attention were noted.  The flatwork at the Subject Property should be addressed as part of routine maintenance.',
                },
                {
                    label: 'Reserve Funding',
                    text: 'Concrete flatwork generally has an EUL in excess of 25 years if constructed over a properly stabilized base and maintained regularly.  No areas requiring immediate attention were noted.  Costs for ongoing concrete repair are included in the Capital Replacement Reserve Schedule.',
                },
            ]
        }
    ]
}

//sec 5.5

export const landscapingAppurtenances = {
    //description block
    description: [
        {
            id:'landscaping',
            type:'textarea',
            label:'Landscaping',
            rows:2,
            defaultValue:'',
            placeholder:'Describe the landscaping...',
            quickOptions: [
                {
                    label: 'Lawns & Trees',
                    text: 'The landscaping consists of a mixture of lawns, bushes and trees, with limited areas of seasonal color. ',
                },
                {
                    label: 'Hardscape',
                    text: 'The landscape consists primarily of hardscape, including rocks, gravel and drought tolerant plants. ',
                },
                {
                    label: 'Minimal',
                    text: 'Minimal landscaping elements are present, such as small areas of grass and decorative planters.  ',
                },
            ],
        },
        {
            id:'sprinkler-system',
            type:'textarea',
            label:'Sprinkler System',
            rows:2,
            defaultValue:'',
            placeholder:'Describe the sprinkler system...',
            quickOptions: [
                {
                    label: 'No Irrigation Present',
                    text: 'No irrigation system is present at the Subject Property. ',
                },
                {
                    label: 'In-Ground Irrigation Installed',
                    text: 'The landscaped areas of the Subject Property are serviced by an in-ground irrigation system. ',
                },
            ],
        },
        {
            id:'property-lighting',
            type:'textarea',
            label:'Property Lighting',
            rows:2,
            defaultValue:'Property-owned, pole-mounted lighting and building-mounted flood lights illuminate the driveways and parking lots.  Incandescent or fluorescent light fixtures are present near building entrances. ',
            quickOptions: null,
        },
        {
            id:'fencing-walls',
            type:'textarea',
            label:'Fencing / Walls',
            rows:2,
            defaultValue:'No privacy fencing or retaining walls are present on the Subject Property. ',
            quickOptions: null,
        },
        {
            id:'other-appurtenances',
            type:'textarea',
            label:'Other Appurtenances',
            rows:2,
            defaultValue:'No other significant landscaping or appurtenances were observed.',
            quickOptions: null,
        }
    ],
    //observations block
    observations: [
        {
            id:'general-condition',
            type:'condition-selector',
            label:'General Condition',
            options: ['Good', 'Fair', 'Poor'],
        },
        {
            id:'age-lastaction',
            type:'textarea',
            label:'Age / Last Action',
            rows:3,
            defaultValue:'The landscaping and appurtenances the Subject Property are original and are addressed as part routine maintenance. ',
            quickOptions: null,
        }
    ],
    //concerns block
    concerns: [
        {
            id:'poor-landscaping',
            type: 'textarea',
            label: 'Poor Landscaping',
            rows: 3,
            defaultValue: 'No significant areas of overgrown or dead landscaping were observed during the assessment.',
            quickOptions: null,
        },
        {
            id:'inadequate-lighting',
            type: 'textarea',
            label: 'Inadequate Lighting',
            rows: 3,
            defaultValue: 'NDDS completed its assessment during daylight hours. No significant concerns relating to inadequate or non-functional lighting were reported to the NDDS assessor. No obvious damage to the lighting fixtures was observed.',
            quickOptions: null,
        },
        {
            id:'damaged-fences-walls',
            type: 'textarea',
            label: 'Damaged Fences/Walls',
            rows: 3,
            defaultValue: 'No damaged fences or walls were noted during the assessment of the property.',
            quickOptions: null,
        },
        {
            id:'other-concerns',
            type: 'textarea',
            label: 'Other',
            rows: 3,
            defaultValue: 'No other significant concerns relating to the landscaping or appurtenances were noted by or reported to the NDDS assessor.',
            quickOptions: null,
        }
    ],
    //recommendations block
    recommendations: [
        {
            id:'recommendations',
            type: 'textarea',
            label: 'Recommendations',
            rows: 3,
            defaultValue: 'The landscaping and appurtenances should be addressed as part of the routine maintenance of the Subject Property. ',
            quickOptions: null,
        }
    ]
}

//sec 5.6

export const ancillaryStructures = {
    //description block
    description: [
        {
            id:'ancillary-structures',
            type:'textarea',
            label:'Ancillary Structures',
            rows:2,
            defaultValue:'The Subject Property does not contain any ancillary structures.',
            placeholder:'Or describe the ancillary structures...',
            quickOptions: null,
        }
    ],
    //observations block
    observations: [
        {
            id:'general-condition',
            type:'condition-selector',
            label:'General Condition',
            options: ['Good', 'Fair', 'Poor'],
        },
        {
            id:'age-lastaction',
            type:'textarea',
            label:'Age / Last Action',
            rows:3,
            defaultValue:'',
            placeholder:'Describe any major replacement activities...',
            quickOptions: [
                {
                    label: 'No ancillary structures',
                    text: 'There are no ancillary structures at the Subject Property. ',
                },
                {
                    label: 'Original / routine maintenance',
                    text: 'The ancillary structures at the Subject Property are original and are maintained as part the routine maintenance. ',
                },
            ],
        }
    ],
    //concerns block
    concerns: [
        {
            id:'ancillary-concerns',
            type: 'textarea',
            label: 'Ancillary Structure Concerns',
            rows: 3,
            defaultValue: '',
            placeholder:'Describe the extent and location of concern...',
            quickOptions: [
                {
                    label: 'No ancillary structures',
                    text: 'There are no ancillary structures at the Subject Property. ',
                },
                {
                    label: 'No concerns noted',
                    text: 'No concerns regarding the ancillary structures were noted by or reported to NDDS\'s assessor. ',
                },
            ],
        }
    ],
    //recommendations block
    recommendations: [
        {
            id:'recommendations',
            type: 'textarea',
            label: 'Recommendations',
            rows: 3,
            defaultValue: '',
            placeholder:'Describe the recommended action...',
            quickOptions: [
                {
                    label: 'No ancillary structures',
                    text: 'There are no ancillary structures at the Subject Property. No further action is required. ',
                },
                {
                    label: 'Good condition / routine maintenance',
                    text: 'The ancillary structures are in good condition and should continue to be addressed as part of the routine maintenance of the facility. ',
                },
            ],
        }
    ]
}

// SECTION 6.0 BUILDING ENVELOPE

//sec 6.1

export const foundation = {
    //description block
    description: [
        {
            id:'foundation',
            type:'textarea',
            label:'Foundation',
            rows:4,
            defaultValue:'',
            placeholder:'Describe the foundation in detail...',
            quickOptions: [
                {
                    label: 'Slab on grade (single building)',
                    text: 'The original plans and specifications for the subject building were not provided. The foundation appears to consist of a reinforced-concrete slab on grade. No crawl spaces, basement areas or subterranean vaults were observed.',
                },
                {
                    label: 'Slab on grade (multiple buildings)',
                    text: 'The original plans and specifications for the subject buildings were not provided. The foundations appear to consist of a reinforced-concrete slab on grade. No crawl spaces, basement areas or subterranean vaults were observed.',
                },
                {
                    label: 'Pier and beam (wood)',
                    text: 'The foundations for the buildings consist of a pier and beam system. The piers and beams were both wood.',
                },
                {
                    label: 'Concrete perimeter footings with basement',
                    text: 'The building\'s foundation consists of reinforced concrete perimeter footings with isolated pad footings at column locations. A reinforced concrete basement slab is present within the bearing walls.',
                },
            ],
        }
    ],
    //observations block
    observations: [
        {
            id:'general-condition',
            type:'condition-selector',
            label:'General Condition',
            options: ['Good', 'Fair', 'Poor'],
        },
        {
            id:'age-lastaction',
            type:'textarea',
            label:'Age / Last Action',
            rows:3,
            defaultValue:'The foundation is the original and are addressed as part routine maintenance.',
            quickOptions: null,
        }
    ],
    //concerns block
    concerns: [
        {
            id:'cracks-settlement',
            type: 'textarea',
            label: 'Cracks/Settlement',
            rows: 3,
            defaultValue: 'No significant foundation cracks or settlement were noted by or reported to NDDS\'s assessor.',
            quickOptions: null,
        },
        {
            id:'insufficient-exposure',
            type: 'textarea',
            label: 'Insufficient Exposure',
            rows: 3,
            defaultValue: '',
            placeholder:'Describe location and extent of concern...',
            quickOptions: [
                {
                    label: 'Minimum visible per standards',
                    text: 'A minimum of four to six inches of the slab foundation was visible per generally accepted construction practices.',
                },
                {
                    label: 'Not visible due to paving',
                    text: 'Due to the presence of asphalt-paved driveways and parking areas and concrete-paved sidewalks, the foundation was not visible. This should not pose a significant concern.',
                },
                {
                    label: 'Covered by landscaping/grading',
                    text: 'The landscaping and property grading covered significant portions of the slab foundation. Generally accepted building practices recommended keeping the top four to six inches of the slab exposed to prevent water penetration and insect infestation.',
                },
            ],
        },
        {
            id:'water-damage',
            type: 'textarea',
            label: 'Water Damage',
            rows: 3,
            defaultValue: 'No major areas of flooding or water damage that would be associated with concerns relating to the foundation were noted by or reported to NDDS\'s assessor.',
            quickOptions: null,
        },
        {
            id:'other-concerns',
            type: 'textarea',
            label: 'Other',
            rows: 3,
            defaultValue: 'No additional concerns relating to the foundation at the Subject Property were noted by or reported to NDDS\'s assessor.',
            quickOptions: null,
        }
    ],
    //recommendations block
    recommendations: [
        {
            id:'recommendations',
            type: 'textarea',
            label: 'Recommendations',
            rows: 3,
            defaultValue: '',
            placeholder:'Make site specific recommendation...',
            quickOptions: [
                {
                    label: 'No significant concerns',
                    text: 'No significant concerns relating to the foundation were noted and no major expenditures relating to the foundation are anticipated during the reserve term.',
                },
                {
                    label: 'Regrading recommended (Deferred Maintenance)',
                    text: 'Regrading around the areas around the foundation to expose the slab is recommended. The regrading should be designed to drain water away from the foundations. Costs for this work are included in the short term of the Deferred Maintenance/Physical Deficiencies Table.',
                },
                {
                    label: 'Regrading recommended (Routine Maintenance)',
                    text: 'Regrading around the areas around the foundation to expose the slab is recommended. The regrading should be designed to drain water away from the foundations. This can be addressed as part of the routine maintenance of the property.',
                },
                {
                    label: 'Structural engineer evaluation recommended',
                    text: 'Based on the extent of the concerns noted, NDDS recommends a structural engineer conduct a more detailed evaluation of the property. Costs for such an engineering evaluation are included in the Deferred Maintenance/Physical Deficiencies Table.',
                },
            ],
        }
    ]
}

//sec 6.2

export const buildingFrame = {
    //description block
    description: [
        {
            id:'building-frame',
            type:'textarea',
            label:'Building Frame',
            rows:2,
            defaultValue:'',
            placeholder:'Describe the building frame...',
            quickOptions: [
                {
                    label: 'Wood-frame construction',
                    text: 'The subject buildings are of wood frame construction.',
                },
                {
                    label: 'Steel-frame construction',
                    text: 'The subject building is of steel-frame construction, with non-load bearing exterior walls.',
                },
                {
                    label: 'Concrete walls / steel columns',
                    text: 'The subject building frame consists of both concrete load bearing exterior walls and interior steel columns.',
                },
            ],
        },
        {
            id:'decking-between-floors',
            type:'textarea',
            label:'Decking Between Floors',
            rows:2,
            defaultValue:'',
            placeholder:'Describe the decking...',
            quickOptions: [
                {
                    label: 'Wood decking over wood frame',
                    text: 'Wood decking over wood frame is present between the floors.',
                },
                {
                    label: 'Metal pan decking with concrete',
                    text: 'Metal pan decking, covered with a concrete floor, is present between the floors.',
                },
                {
                    label: 'Single story (no decking)',
                    text: 'The subject building is a single story structure. There is no decking between floors.',
                },
            ],
        },
        {
            id:'roof-framing-decking',
            type:'textarea',
            label:'Roof Framing/Decking',
            rows:2,
            defaultValue:'',
            placeholder:'Describe the roof framing...',
            quickOptions: [
                {
                    label: 'Pitched wood trusses',
                    text: 'Pitched wood trusses support wood decking.',
                },
                {
                    label: 'Wood framing (flat roof)',
                    text: 'Wood framing and decking support the flat roof system.',
                },
                {
                    label: 'Steel joists / metal-pan decking',
                    text: 'Open-web steel joists and steel L-beams support metal-pan decking.',
                },
            ],
        }
    ],
    //observations block
    observations: [
        {
            id:'general-condition',
            type:'condition-selector',
            label:'General Condition',
            options: ['Good', 'Fair', 'Poor'],
        },
        {
            id:'age-lastaction',
            type:'textarea',
            label:'Age / Last Action',
            rows:3,
            defaultValue:'The framing is original and maintained as needed.',
            quickOptions: null,
        }
    ],
    //concerns block
    concerns: [
        {
            id:'wall-cracks',
            type: 'textarea',
            label: 'Wall Cracks',
            rows: 3,
            defaultValue: 'No significant signs of cracking were observed on the interior or exterior walls. No history of cracking was reported to the assessor.',
            quickOptions: null,
        },
        {
            id:'bowed-walls',
            type: 'textarea',
            label: 'Bowed Walls',
            rows: 3,
            defaultValue: 'No evidence of bowed walls was noted by or reported to NDDS\'s assessor.',
            quickOptions: null,
        },
        {
            id:'sagging-ceilings-floors',
            type: 'textarea',
            label: 'Sagging Ceilings/Floors',
            rows: 3,
            defaultValue: 'No evidence of sagging ceilings or floors was noted by or reported to NDDS\'s assessor.',
            quickOptions: null,
        },
        {
            id:'sticking-doors-windows',
            type: 'textarea',
            label: 'Sticking Doors/Windows',
            rows: 3,
            defaultValue: 'No sticking doors and windows were noted that would indicate significant movement of the buildings.',
            quickOptions: null,
        },
        {
            id:'deteriorated-framing',
            type: 'textarea',
            label: 'Deteriorated Framing',
            rows: 3,
            defaultValue: 'No deteriorated framing or support members were observed by or reported to the NDDS assessor.',
            quickOptions: null,
        },
        {
            id:'fire-retardant-decking',
            type: 'textarea',
            label: 'Fire-Retardant Decking',
            rows: 4,
            defaultValue: 'The use of fire-retardant plywood decking started in the early 1980s.  Certain types of fire-retardant treated plywood rapidly deteriorate when exposed to excessive heat and humidity or may cause nails or metal fasteners to corrode.  Common signs of fire-retardant plywood include darkening of the wood and the presence of a powder-like substance, warping of the roof and the curling of shingles.  No indications of fire-retardant plywood were noted. No plywood decking is present. ',
            quickOptions: null,
        },
        {
            id:'other-concerns',
            type: 'textarea',
            label: 'Other',
            rows: 3,
            defaultValue: 'No other concerns relating to the framing or decking at the Subject Property were noted by or reported to NDDS\'s assessor.',
            quickOptions: null,
        }
    ],
    //recommendations block
    recommendations: [
        {
            id:'recommendations',
            type: 'textarea',
            label: 'Recommendations',
            rows: 3,
            defaultValue: '',
            placeholder: 'Make a site specific recommendation...',
            quickOptions: [
                {
                    label: 'No significant concerns',
                    text: 'No significant concerns relating to the building frame and decking were noted by or reported to NDDS\'s assessor. No significant expenditures are anticipated during the reserve term.',
                },
                {
                    label: 'Structural engineer evaluation recommended',
                    text: 'Based on concerns noted above, NDDS recommends a structural engineer conduct a more detailed evaluation of the buildings. An estimated cost for this evaluation is included in the Deferred Maintenance/Physical Deficiencies Table.',
                },
            ],
        }
    ]
}

//sec 6.3

export const facadesCurtainWall = {
    //description block
    description: [
        {
            id:'exterior-walls',
            type:'textarea',
            label:'Exterior Walls',
            rows:2,
            defaultValue:'',
            placeholder:'The exterior walls consist of...',
            quickOptions: null,
        },
        {
            id:'fascia-soffits-trim',
            type:'textarea',
            label:'Fascia/Soffits/Trim',
            rows:2,
            defaultValue:'',
            placeholder:'Describe...',
            quickOptions: null,
        },
        {
            id:'doors-window',
            type:'textarea',
            label:'Doors/Window',
            rows:3,
            defaultValue:'',
            placeholder:'Describe accordingly...',
            quickOptions: [
                {
                    label: 'Glass/aluminum doors, storefront windows',
                    text: 'The entrance doors consist of glass in aluminum frames. Emergency doors and employee areas doors are steel in steel frame. The windows are non-opening glass storefront windows in metal framing.',
                },
                {
                    label: 'Metal doors, single-pane wood windows',
                    text: 'The entrance doors are metal in metal framing. The windows are single-pane glass in wood framing.',
                },
            ],
        },
        {
            id:'stairs-walkways-landings',
            type:'textarea',
            label:'Stairs/Walkways/Landings',
            rows:3,
            defaultValue:'',
            placeholder:'Describe accordingly...',
            quickOptions: [
                {
                    label: 'No exterior stairs',
                    text: 'No exterior stairs are present.',
                },
                {
                    label: 'Poured concrete stairs/landings',
                    text: 'The exterior stairs are poured concrete with steel railings. The landings are poured concrete slabs. No walkways are present.',
                },
                {
                    label: 'Metal-framed stairs with concrete',
                    text: 'Exterior stairs are metal-framed with concrete in metal tray treads and steel railings. The landings and walkways are concrete filled metal-pan decking and provide access to each of the living units.',
                },
            ],
        },
        {
            id:'other-facades',
            type:'textarea',
            label:'Other',
            rows:2,
            defaultValue:'No other significant components to the facades were noted.',
            quickOptions: null,
        }
    ],
    //observations block
    observations: [
        {
            id:'general-condition',
            type:'condition-selector',
            label:'General Condition',
            options: ['Good', 'Fair', 'Poor'],
        },
        {
            id:'age-lastaction',
            type:'textarea',
            label:'Age / Last Action',
            rows:3,
            defaultValue:'The structural components of the facades, including the exterior walls, windows and doors, are original. Repairs and periodic maintenance, such as painting and caulking, are handled on an as-needed basis.',
            quickOptions: null,
        }
    ],
    //concerns block
    concerns: [
        {
            id:'use-of-eifs',
            type: 'textarea',
            label: 'Use of EIFS',
            rows: 5,
            defaultValue: '',
            placeholder: 'Evidence of water penetration was noted...provide locations and extent...',
            quickOptions: [
                {
                    label: 'No evidence of EIFS',
                    text: 'An exterior insulation and finish system (EIFS), also referred to as synthetic stucco, refers to a multi-layered exterior wall system consisting of a base coat, mesh and insulation board, and a finish coat that are mechanically secured or glued to plywood or another substrate. Research has discovered that if water enters the EIFS wall system through surface penetrations, around flashings at architectural details and past caulked joints around window and door openings, the structural wood framing and sheathing can rot. Due to the hidden nature of this kind of damage, NDDS cannot attest to the long-term durability of the EIFS or its effect on the structure. No evidence of EIFS was observed.',
                },
                {
                    label: 'EIFS present, no water damage identified',
                    text: 'An exterior insulation and finish system (EIFS), also referred to as synthetic stucco, refers to a multi-layered exterior wall system consisting of a base coat, mesh and insulation board, and a finish coat that are mechanically secured or glued to plywood or another substrate. Research has discovered that if water enters the EIFS wall system through surface penetrations, around flashings at architectural details and past caulked joints around window and door openings, the structural wood framing and sheathing can rot. Due to the hidden nature of this kind of damage, NDDS cannot attest to the long-term durability of the EIFS or its effect on the structure. NDDS did not identify any indications of water damage or penetration during the assessment.',
                },
            ],
        },
        {
            id:'use-of-hardboard-siding',
            type: 'textarea',
            label: 'Use of Hardboard Siding',
            rows: 5,
            defaultValue: '',
            placeholder: 'Areas of deteriorating hardboard were identified...discuss the location and extent...',
            quickOptions: [
                {
                    label: 'No hardboard siding observed',
                    text: 'Hardboard siding is made by combining wood shavings or fibers with resins or glues. Class action suits have been brought against some manufacturers of these products, including Masonite and Louisiana Pacific. These suits claim that the siding warps, swells and generally deteriorates. No hardboard siding was observed during the site visit.',
                },
                {
                    label: 'Hardboard present, no concerns noted',
                    text: 'Hardboard siding is made by combining wood shavings or fibers with resins or glues. Class action suits have been brought against some manufacturers of these products, including Masonite and Louisiana Pacific. These suits claim that the siding warps, swells and generally deteriorates. While NDDS cannot attest to the long-term durability of the hardboard siding, no concerns were noted by or reported to NDDS\'s assessor during the assessment.',
                },
            ],
        },
        {
            id:'deteriorated-wood',
            type: 'textarea',
            label: 'Deteriorated Wood',
            rows: 3,
            defaultValue: '',
            placeholder: 'Describe the extent and location of the concern...',
            quickOptions: [
                {
                    label: 'No wood on exterior',
                    text: 'Wood is not present on the exterior façade or trim.',
                },
                {
                    label: 'No significant deterioration',
                    text: 'No significant evidence of deteriorated wood was noted or reported.',
                },
            ],
        },
        {
            id:'worn-paint',
            type: 'textarea',
            label: 'Worn Paint',
            rows: 3,
            defaultValue: '',
            placeholder: 'Describe the extent and location of the concern...',
            quickOptions: [
                {
                    label: 'Buildings are not painted',
                    text: 'The buildings are not painted.',
                },
                {
                    label: 'No worn or deteriorated paint',
                    text: 'No evidence of worn or deteriorated paint was noted.',
                },
            ],
        },
        {
            id:'damaged-masonry',
            type: 'textarea',
            label: 'Damaged Masonry',
            rows: 3,
            defaultValue: '',
            placeholder: 'Describe the extent and location of the concern...',
            quickOptions: [
                {
                    label: 'No masonry walls present',
                    text: 'No masonry walls are present.',
                },
                {
                    label: 'Masonry in good condition',
                    text: 'The masonry walls were in good condition. No significant deterioration of the pointing was noted.',
                },
            ],
        },
        {
            id:'water-penetration',
            type: 'textarea',
            label: 'Water Penetration',
            rows: 3,
            defaultValue: 'No evidence of water penetration through walls, around windows and doors, or in any other manner related to the façade of the building, was observed by or reported to NDDS\'s assessor.',
            quickOptions: null,
        },
        {
            id:'termites-borers',
            type: 'textarea',
            label: 'Termites/Borers',
            rows: 3,
            defaultValue: 'No evidence of termites or other wood boring insects was observed by or reported to NDDS\'s assessor.',
            quickOptions: null,
        },
        {
            id:'other-concerns',
            type: 'textarea',
            label: 'Other',
            rows: 4,
            defaultValue: '',
            placeholder: 'Describe the extent and location of concerns relating to the façade, windows, doors, exterior stairs, landings, etc...',
            quickOptions: [
                {
                    label: 'No other concerns',
                    text: 'No other concerns relating to the facades at the Subject Property were noted by or reported to NDDS\'s assessor.',
                },
                {
                    label: 'NYC Local Law 11/98 Façade Inspections',
                    text: 'New York City Building Code Local Law 11/98 "Façade Inspections" requires that facade inspections be performed for all building greater than six stories. Local Law 11 requires that the inspection be conducted on all building elevations, not just the front façade. In addition, the law now requires a scaffold drop or a platform inspection from top-of-grade of a representative drop. Façade assessor s must report that a condition falls within one of three categories: "Safe", "Safe with a repair and maintenance program" or "Unsafe." Any condition described as Safe with a repair and maintenance program will be required to be repaired within a five year time frame or else the condition will automatically be downgraded to Unsafe. Conditions described as unsafe must be repaired immediately or the building ownership will be subject to fines during the next five year cycle. The last Local Law cycle reporting was...describe when it was due and what were the results...',
                },
            ],
        },
    ],
    //recommendations block
    recommendations: [
        {
            id:'recommendations',
            type: 'textarea',
            label: 'Recommendations',
            rows: 4,
            defaultValue: '',
            placeholder: 'Make a site specific recommendation...',
            quickOptions: [
                {
                    label: 'No significant concerns',
                    text: 'No significant concerns relating to the building facades were noted by or reported to NDDS\'s assessor. No significant expenditures are anticipated during the reserve term.',
                },
                {
                    label: 'Exterior maintenance (painting/caulking 6-8 years)',
                    text: 'Exterior maintenance, such as power-washing, painting and caulking, is required every six to eight years depending on the quality of work performed, quality of materials used and weather conditions. The buildings are likely to require maintenance during the reserve term and costs are included in the Capital Replacement Reserve Schedule. The remaining portions of the facade should be monitored and addressed as part of the routine maintenance of the Subject Property.',
                },
                {
                    label: 'Exterior maintenance (masonry/caulking 10-15 years)',
                    text: 'Exterior maintenance, such as power-washing, pointing the masonry work and caulking windows, is likely to be need every ten to 15 years depending on the quality of work performed, quality of materials used and weather conditions. The buildings are likely to require maintenance during the reserve term and costs are included in the Capital Replacement Reserve Schedule. The remaining portions of the facade should be monitored and addressed as part of the routine maintenance of the Subject Property.',
                },
                {
                    label: 'Exterior maintenance (curtain wall 10-15 years)',
                    text: 'Exterior maintenance, such as wet-sealing the curtain wall is likely to be required every ten to 15 years depending on the quality of work performed, quality of materials used and weather conditions. The buildings are likely to require maintenance during the reserve term and costs are included in the Capital Replacement Reserve Schedule. The remaining portions of the facade should be monitored and addressed as part of the routine maintenance of the Subject Property.',
                },
                {
                    label: 'Termite inspection recommended',
                    text: 'Based on the wood construction and lack of a current termite and boring insect inspection report, NDDS recommends that a state licensed assessor be retained to conduct an inspection. A cost for the inspection is included in the Deferred Maintenance Table. Periodic follow-up inspections should be handled as part of routine maintenance.',
                },
                {
                    label: 'Detailed inspection recommended (hardboard/EIFS)',
                    text: 'Based on the presence of hardboard/EIFS exterior walls and indications of water damage, NDDS recommends that a more detailed inspection, that may include moisture tests with the exterior walls and/or invasive observations such as removal of portions of the façade or exterior walls, be conducted. An estimated cost for a more detailed assessment is included in the Capital Replacement Reserve Schedule.',
                },
            ],
        }
    ]
}

//sec 6.4

export const roofing = {
    //description block
    description: [
        {
            id:'roofing-system',
            type:'textarea',
            label:'Roofing System',
            rows:3,
            defaultValue:'',
            placeholder:'Describe the roofing system...',
            quickOptions: [
                {
                    label: 'Pitched with asphalt shingles',
                    text: 'The roofing systems are pitched with wood framing and decking covered with asphalt composition shingles.',
                },
                {
                    label: 'Flat with steel/metal decking',
                    text: 'The roofing system is flat with steel framing and corrugated metal decking covered with...',
                },
            ],
        },
        {
            id:'drainage',
            type:'textarea',
            label:'Drainage',
            rows:3,
            defaultValue:'',
            placeholder:'Describe the drainage system...',
            quickOptions: [
                {
                    label: 'Gutters and downspouts',
                    text: 'Gutters are located along the eaves and feed storm water into downspouts that discharge into landscaped areas near the buildings.',
                },
                {
                    label: 'Sheet flow',
                    text: 'Storm water from the pitched roofs runs off via sheet flow onto the Subject Property.',
                },
                {
                    label: 'Interior roof drains',
                    text: 'The roof has a slight slope designed to direct storm water to interior roof drains that tie underground into the city\'s storm water system.',
                },
            ],
        },
        {
            id:'parapets-coping',
            type:'textarea',
            label:'Parapets/Coping',
            rows:2,
            defaultValue:'',
            placeholder:'Describe the parapets/coping...',
            quickOptions: [
                {
                    label: 'No parapet walls',
                    text: 'No parapet walls are present.',
                },
                {
                    label: 'Concrete block with aluminum coping',
                    text: 'The parapet walls are painted concrete block with aluminum coping.',
                },
            ],
        },
        {
            id:'other-roofing',
            type:'textarea',
            label:'Other',
            rows:2,
            defaultValue:'',
            placeholder:'Describe the other roofing components...',
            quickOptions: [
                {
                    label: 'Typical roof penetrations',
                    text: 'Typical roof penetrations are present for sanitary stacks, furnace and water heater exhausts and roof vents.',
                },
                {
                    label: 'No other significant components',
                    text: 'No other significant roofing components were noted.',
                },
            ],
        }
    ],
    //observations block
    observations: [
        {
            id:'general-condition',
            type:'condition-selector',
            label:'General Condition',
            options: ['Good', 'Fair', 'Poor'],
        },
        {
            id:'age-lastaction',
            type:'textarea',
            label:'Age / Last Action',
            rows:3,
            defaultValue:'The roofing systems are original and are patched or repaired as needed on an ongoing basis as part of the routine maintenance of the facility.',
            placeholder:'Or describe the last major action and date...',
            quickOptions: null,
        }
    ],
    //concerns block
    concerns: [
        {
            id:'leaks',
            type: 'textarea',
            label: 'Leaks',
            rows: 3,
            defaultValue: 'No leaks were noted by or reported to NDDS\'s assessor.',
            quickOptions: null,
        },
        {
            id:'significant-ponding',
            type: 'textarea',
            label: 'Significant Ponding',
            rows: 3,
            defaultValue: 'No indications of significant ponding were noted during the assessment.',
            quickOptions: null,
        },
        {
            id:'evidence-of-repairs',
            type: 'textarea',
            label: 'Evidence of Repairs',
            rows: 3,
            defaultValue: 'No significant areas of patching or repairs were noted during the assessment.',
            quickOptions: null,
        },
        {
            id:'area-of-roof-damage',
            type: 'textarea',
            label: 'Area of Roof Damage',
            rows: 3,
            defaultValue: 'No significant areas of damaged roofing were noted during the assessment. No significant damage to the flashing or parapet areas were noted during the assessment.',
            quickOptions: null,
        },
        {
            id:'damaged-gutters',
            type: 'textarea',
            label: 'Damaged Gutters',
            rows: 3,
            defaultValue: 'The gutters and downspouts appeared to be in good condition. No significant areas of damage or missing sections were noted during the assessment.',
            quickOptions: null,
        },
        {
            id:'other-concerns',
            type: 'textarea',
            label: 'Other',
            rows: 3,
            defaultValue: 'No other concerns relating to the roofing systems were noted.',
            quickOptions: null,
        }
    ],
    //recommendations block
    recommendations: [
        {
            id:'recommendations',
            type: 'textarea',
            label: 'Recommendations',
            rows: 4,
            defaultValue: '',
            placeholder: 'Or make site specific recommendation...',
            quickOptions: [
                {
                    label: 'No major replacement (EUL 20-25 years)',
                    text: 'Based on an EUL of 20 to 25 years, no major replacement of the roofing systems is anticipated during the reserve term, provided normal levels of routine maintenance, such as patching periodic leaks and clearing drainage systems, are performed.',
                },
                {
                    label: 'No major replacement (EUL 15-20 years, reserve for patching)',
                    text: 'Based on an EUL of 15 to 20 years, no major replacement of the roofing systems is anticipated during the reserve term. NDDS has included allowances in the Capital Replacement Reserve Schedule for periodic roof patching and maintenance.',
                },
                {
                    label: 'Replacement likely (EUL 15-20 years)',
                    text: 'Based on the age of the roof and an EUL of 15 to 20 years, replacement is likely to be required during the reserve term and costs for this work have been included in the Capital Replacement Reserve Schedule.',
                },
                {
                    label: 'No deficiencies / routine maintenance',
                    text: 'No deficiencies were observed or reported. The components can be maintained under routine maintenance as part of the normal operating program during the term.',
                },
            ],
        }
    ]
}

//SECTION 7 - MECHANICAL, ELECTRICAL AND PLUMBING SYSTEMS

//sec 7.1 HEATING AND COOLING SYSTEMS

export const heatingAndCooling = {
    equipmentList: {
        label: 'HVAC Equipment',
        fields: [
            { id: 'description', label: 'Equipment Description', placeholder: 'e.g. Rooftop Package Unit', width: 'flex-[2]' },
            { id: 'model', label: 'Model Number', placeholder: 'Model #' },
            { id: 'size', label: 'Size', placeholder: 'e.g. 5 ton' },
            { id: 'mfg-date', label: 'Manufacturer Date', placeholder: 'YYYY' },
            { id: 'condition', label: 'Condition', type: 'condition-selector' as const, options: ['Good', 'Fair', 'Poor'] },
        ],
    },
    //description block
    description: [
        {
            id:'heating-and-cooling',
            type:'textarea',
            label:'Heating and Cooling',
            rows:4,
            defaultValue:'',
            placeholder:'Or describe the HVAC system in detail...',
            quickOptions: [
                {
                    label: 'Roof-mounted package units',
                    text: 'Heating and cooling are provided by roof-mounted package units. The heating units are gas-fired, while the air conditioning condensers are electric.',
                },
                {
                    label: 'Tenant-specific furnaces / pad-mounted condensers',
                    text: 'Heating is provided by tenant-specific furnaces located in the _______. Air conditioning is provided by pad-mounted condenser units. The condenser units range from three to five tons in capacity.',
                },
                {
                    label: 'PTAC units',
                    text: 'Heating and cooling are provided by electric packaged thru-wall air conditioning (PTAC) units. The average capacity of the units observed was three tons.',
                },
                {
                    label: 'Two-pipe water system (boilers/chillers)',
                    text: 'Heat and cooling is provided by a two-pipe water system. The hot water is produced by two 560 horsepower, 24,056 MBH Johnston steam boilers. Chilled water is produced from two 585-ton Trane centrifugal chillers and one 169-ton Trane centrifugal chiller in conjunction with a two-cell, 1,200-ton Baltimore Air Coil cooling tower on the roof.',
                },
            ],
        }
    ],
    //observations block
    observations: [
        {
            id:'general-condition',
            type:'condition-selector',
            label:'General Condition',
            options: ['Good', 'Fair', 'Poor'],
        },
        {
            id:'age-lastaction',
            type:'textarea',
            label:'Age / Last Action',
            rows:3,
            defaultValue:'',
            placeholder:'Describe the last major HVAC repair or action...',
            quickOptions: [
                {
                    label: 'HVAC system is original',
                    text: 'The heating, ventilation and air conditioning (HVAC) system is original.',
                },
                {
                    label: 'Serviced and replaced as needed',
                    text: 'The furnaces and condensers are serviced and repaired as need as part of the routine maintenance of the facility. Units are replaced when required on an on-going basis. It is estimated that approximately ____ have been replaced in the last three years.',
                },
            ],
        }
    ],
    //concerns block
    concerns: [
        {
            id:'inoperable-equipment',
            type: 'textarea',
            label: 'Inoperable Equipment',
            rows: 3,
            defaultValue: 'All of the systems and equipment observed were operable at the time of the assessment. No significantly obsolete equipment was noted. No concerns regarding inoperable equipment was reported to NDDS by the property contacts.',
            quickOptions: null,
        },
        {
            id:'insufficient-capacity',
            type: 'textarea',
            label: 'Insufficient Capacity',
            rows: 3,
            defaultValue: 'No concerns regarding the capacity of the HVAC systems were reported to NDDS. The units appeared adequately sized for the current usage of the property.',
            quickOptions: null,
        },
        {
            id:'use-of-cfc-refrigerants',
            type: 'textarea',
            label: 'Use of CFC Refrigerants',
            rows: 5,
            defaultValue: '',
            placeholder: 'Or describe location and extent of concern...',
            quickOptions: [
                {
                    label: 'No CFC refrigerant use noted',
                    text: 'As of July 1, 1992, it became illegal to intentionally vent CFC refrigerants to the atmosphere, and the manufacture of CFC refrigerants was phased out in 1995. CFC refrigerants include R 11, R 12, R 113, R 114 and R 115. No CFC refrigerant use was noted or reported.',
                },
                {
                    label: 'R-22 refrigerant / replacement by 2030',
                    text: 'As of July 1, 1992, it became illegal to intentionally vent CFC refrigerants to the atmosphere, and the manufacture of CFC refrigerants was phased out in 1995. CFC refrigerants include R 11, R 12, R 113, R 114 and R 115. The two 585-ton chillers are using R-134a, which is an acceptable refrigerant. The 169-ton chiller is using R-11. The rooftop units serving the Subject Property are utilizing R-22 refrigerant. R-22 is a hydro-chlorofluorocarbon (HCFC) refrigerant that cannot be intentionally vented to the atmosphere and is scheduled to be phased out of production in 2030. The packaged units will require replacement by 2030, and should be replaced with a unit that utilizes an acceptable refrigerant.',
                },
            ],
        },
        {
            id:'other-concerns',
            type: 'textarea',
            label: 'Other',
            rows: 3,
            defaultValue: 'No additional concerns relating to the HVAC system at the Subject Property were noted by or reported to NDDS\'s assessor.',
            quickOptions: null,
        }
    ],
    //recommendations block
    recommendations: [
        {
            id:'recommendations',
            type: 'textarea',
            label: 'Recommendations',
            rows: 4,
            defaultValue: '',
            placeholder: 'Or make other site-specific recommendation...',
            quickOptions: [
                {
                    label: 'Furnaces (EUL 20-25 years) / Condensers (EUL 10-15 years)',
                    text: 'The furnaces generally have an EUL of 20 to 25 years. The EUL can be extended significantly with the periodic replacement of fan motors, burner assemblies and thermostats, which can be done as part of routine maintenance. Therefore, no significant replacement is anticipated during the reserve term. The condenser units have an EUL of 10 to 15 years. Replacement of some of these units is anticipated during the reserve term and an allowance has been included in the Capital Replacement Reserve Schedule. The regular changing of the air conditioning filters, cleaning of drip pans and keeping the drain lines clear as well as cleaning of the condenser coils should be handled as part of routine maintenance.',
                },
                {
                    label: 'Package units (EUL 15-20 years)',
                    text: 'The package units have an EUL of 15 to 20 years. Based on the age of the current units, some replacement is anticipated during the reserve term and an allowance for the replacement of package units is included in the Capital Replacement Reserve Schedule. The regular changing of the air conditioning filters, cleaning of drip pans and keeping the drain lines clear as well as cleaning of the condenser coils should be handled as part of routine maintenance.',
                },
                {
                    label: 'Boiler/chiller overhaul anticipated',
                    text: 'NDDS anticipates a major overhaul of the boiler and the chiller/cooling tower systems will be required during the reserve term and has included an allowance for this work in the Capital Replacement Reserve Schedule. Costs for some ongoing repairs and parts replacement for the HVAC system are also included in the table. The regular changing of the air conditioning filters, cleaning of drip pans and keeping the drain lines clear as well as cleaning of the condenser coils should be handled as part of routine maintenance.',
                },
            ],
        },
    ]
}

//sec 7.2 ELECTRICAL SYSTEMS

export const electrical = {
    //description block
    description: [
        {
            id:'level-of-service',
            type:'textarea',
            label:'Level of Service',
            rows:2,
            defaultValue:'',
            placeholder:'Describe the level of service...',
            quickOptions: [
                {
                    label: 'Tenant space amperes',
                    text: 'Each tenant space is provided ___ amperes of service.',
                },
                {
                    label: '600-volt, three phase, four-wire',
                    text: 'The subject building is serviced by a 600-volt, three phase, four-wire service at 400 amperes.',
                },
            ],
        },
        {
            id:'wiring',
            type:'textarea',
            label:'Wiring',
            rows:2,
            defaultValue:'',
            placeholder:'Describe the wiring...',
            quickOptions: [
                {
                    label: 'All copper wiring',
                    text: 'All wiring observed was copper.',
                },
                {
                    label: 'Aluminum to building / copper branch',
                    text: 'Wiring to the building was reportedly aluminum. The branch wiring within the building was observed to be copper.',
                },
                {
                    label: 'Aluminum branch wiring',
                    text: 'Aluminum branch wiring was observed within the buildings.',
                },
            ],
        },
        {
            id:'overload-protection',
            type:'textarea',
            label:'Overload Protection',
            rows:2,
            defaultValue:'',
            quickOptions: [
                {
                    label: 'Circuit breakers',
                    text: 'Overload protection was provided by circuit breakers.',
                },
                {
                    label: 'Fuses',
                    text: 'Overload protection was provided by fuses.',
                },
            ],
        },
        {
            id:'metering',
            type:'textarea',
            label:'Metering',
            rows:2,
            defaultValue:'',
            placeholder:'Describe the metering...',
            quickOptions: [
                {
                    label: 'Individually metered',
                    text: 'Each tenant space was individually metered.',
                },
                {
                    label: 'Single tenant / no sub-metering',
                    text: 'The Subject Property is a single tenant facility; therefore, there is no sub-metering.',
                },
                {
                    label: 'Centrally metered',
                    text: 'The Subject Property is centrally metered. No individual tenant metering is provided.',
                },
            ],
        },
        {
            id:'other-electrical',
            type:'textarea',
            label:'Other',
            rows:2,
            defaultValue:'',
            placeholder:'Describe the other electrical components...',
            quickOptions: [
                {
                    label: 'No other significant components',
                    text: 'No other significant electrical components were noted.',
                },
                {
                    label: 'Backup generator',
                    text: 'The Subject Property features a natural gas-fired 15 kilowatt backup generator.',
                },
            ],
        }
    ],
    //observations block
    observations: [
        {
            id:'general-condition',
            type:'condition-selector',
            label:'General Condition',
            options: ['Good', 'Fair', 'Poor'],
        },
        {
            id:'age-lastaction',
            type:'textarea',
            label:'Age / Last Action',
            rows:3,
            defaultValue:'The electrical system is original and is maintained as part of the routine maintenance of the facility.',
            quickOptions: null,
        }
    ],
    //concerns block
    concerns: [
        {
            id:'insufficient-capacity',
            type: 'textarea',
            label: 'Insufficient Capacity',
            rows: 3,
            defaultValue: '',
            placeholder: 'Discuss the capacity concern...',
            quickOptions: [
                {
                    label: 'No capacity concerns',
                    text: 'No concerns regarding the capacity of the electrical system was reported to NDDS.',
                },
                {
                    label: '40 amperes insufficient',
                    text: 'Each living unit only received 40 amperes of service. With the common usage of refrigerators, microwaves, coffee makers computers and other electrical equipment, this is generally not considered sufficient capacity.',
                },
            ],
        },
        {
            id:'aluminum-wiring',
            type: 'textarea',
            label: 'Aluminum Wiring',
            rows: 4,
            defaultValue: '',
            placeholder: 'Describe aluminum wiring concerns...',
            quickOptions: [
                {
                    label: 'No aluminum branch wiring',
                    text: 'No aluminum branch wiring was observed.',
                },
                {
                    label: 'Aluminum supply only / copper branch',
                    text: 'While the wiring to the property was reported to be aluminum, the branch wiring within the building was observed to be copper. Aluminum supply wiring is not considered to pose the same fire concern that aluminum branch wiring poses and no further action is required regarding the supply wiring.',
                },
                {
                    label: 'Aluminum branch wiring observed (receptacles not rated for aluminum)',
                    text: 'Aluminum branch wiring was observed at the Subject Property. When used with receptacles not rated to handle aluminum wiring, aluminum wiring can pose a fire hazard. NDDS inspected representative receptacles. The receptacles inspected did not indicate that they were rated for aluminum wiring.',
                },
                {
                    label: 'Aluminum branch wiring observed (CO/AL rated receptacles, no historical concerns)',
                    text: 'Aluminum branch wiring was observed at the Subject Property. When used with receptacles not rated to handle aluminum wiring, aluminum wiring can pose a fire hazard. NDDS inspected representative receptacles. The receptacles inspected were marked CO/AL indicating they were designed for use with aluminum wiring. The property contact indicated that there have not been any historical concerns relating to the electrical wiring at the property.',
                },
            ],
        },
        {
            id:'inappropriate-receptacles',
            type: 'textarea',
            label: 'Inappropriate Receptacles',
            rows: 3,
            defaultValue: '',
            placeholder: 'Make site specific discussion...',
            quickOptions: [
                {
                    label: 'GFCI present in appropriate areas',
                    text: 'In general, ground fault current interrupt (GFCI) are required by code to be installed in area near water sources, such as in bathrooms and kitchens. In the areas observed, NDDS noted GFCI receptacles were present in the appropriate areas.',
                },
                {
                    label: 'No GFCI noted',
                    text: 'In general, ground fault current interrupt (GFCI) are required by code to be installed in area near water sources, such as in bathrooms and kitchens. No GFCI were noted in the areas inspected by NDDS.',
                },
            ],
        },
        {
            id:'other-concerns',
            type: 'textarea',
            label: 'Other',
            rows: 3,
            defaultValue: 'No additional concerns relating to the electrical system at the Subject Property were noted by or reported to NDDS\'s assessor.',
            quickOptions: null,
        }
    ],
    //recommendations block
    recommendations: [
        {
            id:'recommendations',
            type: 'textarea',
            label: 'Recommendations',
            rows: 4,
            defaultValue: '',
            placeholder: 'Make other site specific recommendation...',
            quickOptions: [
                {
                    label: 'No concerns / routine maintenance',
                    text: 'No concerns with the electrical system were noted. The electrical system should continue to be maintained as part of the routine maintenance of the facility.',
                },
                {
                    label: 'Load study recommended',
                    text: 'It appears that the living units may not have adequate electrical capacity. NDDS recommends a load study be conducted to determine the capacity required. An allowance for the load study is included in the Deferred Maintenance Table. Additional costs are likely to be required after the load study to upgrade the electrical capacity in each living unit.',
                },
                {
                    label: 'Aluminum wiring / no action (rated receptacles)',
                    text: 'Aluminum branch wiring was observed at the Subject Property. The receptacles observed were rated for use with aluminum wire and there has been no history of fires resulting from the wiring; therefore, no further action is recommended at this time.',
                },
                {
                    label: 'GFCI installation recommended (routine maintenance)',
                    text: 'GFCI receptacles were not present (note where). In general, the code requirements for the installation of GFCIs were instituted in 1986. Given the post 1986 construction, in order to bring the units up to current building standards, GFCI receptacles should be installed. ',
                },
                {
                    label: 'GFCI installation recommended (Deferred Maintenance)',
                    text: 'GFCI receptacles were not present (note where). In general, the code requirements for the installation of GFCIs were instituted in 1986. Given the post 1986 construction, in order to bring the units up to current building standards, GFCI receptacles should be installed.',
                },
            ],
        }
    ]
}

//sec 7.3 PLUMBING SYSTEMS

export const plumbing = {
    //description block
    description: [
        {
            id:'supply-piping',
            type:'textarea',
            label:'Supply Piping',
            rows:2,
            defaultValue:'',
            placeholder:'The supply lines are...',
            quickOptions: null,
        },
        {
            id:'waste-piping',
            type:'textarea',
            label:'Waste Piping',
            rows:2,
            defaultValue:'',
            placeholder:'The waste lines are...',
            quickOptions: null,
        },
        {
            id:'hot-water-production',
            type:'textarea',
            label:'Hot Water Production',
            rows:2,
            defaultValue:'',
            placeholder:'Domestic hot water at the property is generated by...',
            quickOptions: null,
        },
        {
            id:'other-plumbing',
            type:'textarea',
            label:'Other',
            rows:2,
            defaultValue:'',
            placeholder:'Discuss anything unique, such as septic systems, lift stations and water treatment facilities...',
            quickOptions: null,
        }
    ],
    //observations block
    observations: [
        {
            id:'general-condition',
            type:'condition-selector',
            label:'General Condition',
            options: ['Good', 'Fair', 'Poor'],
        },
        {
            id:'age-lastaction',
            type:'textarea',
            label:'Age / Last Action',
            rows:3,
            defaultValue:'The supply and waste piping are original and is maintained as part of the routine maintenance of the facility. Water heaters are replaced on an as-needed basis.',
            quickOptions: null,
        }
    ],
    //concerns block
    concerns: [
        {
            id:'inoperable-equipment',
            type: 'textarea',
            label: 'Inoperable Equipment',
            rows: 3,
            defaultValue: 'All of the systems and equipment observed were operable at the time of the assessment. No significantly obsolete equipment was noted. No concerns regarding inoperable equipment was reported to NDDS by the property contacts.',
            quickOptions: null,
        },
        {
            id:'pb-piping',
            type: 'textarea',
            label: 'PB Piping',
            rows: 3,
            defaultValue: 'No PB piping was noted by or reported to the NDDS assessor.',
            quickOptions: null,
        },
        {
            id:'abs-piping',
            type: 'textarea',
            label: 'ABS Piping',
            rows: 3,
            defaultValue: 'No ABS piping was noted by or reported to the NDDS assessor.',
            quickOptions: null,
        },
        {
            id:'galvanized-piping',
            type: 'textarea',
            label: 'Galvanized Piping',
            rows: 3,
            defaultValue: 'No evidence of galvanized piping was noted by or reported to the NDDS assessor.',
            quickOptions: null,
        },
        {
            id:'deterioration-leaks',
            type: 'textarea',
            label: 'Deterioration/Leaks',
            rows: 3,
            defaultValue: 'No evidence of wide spread deterioration of or leaks in the supply and waste piping was observed by or reported to the NDDS assessor.',
            quickOptions: null,
        },
        {
            id:'insufficient-water-pressure',
            type: 'textarea',
            label: 'Insufficient Water Pressure',
            rows: 3,
            defaultValue: 'No concerns associated with insufficient water pressure were observed by or reported to the NDDS assessor.',
            quickOptions: null,
        },
        {
            id:'blocked-drainage',
            type: 'textarea',
            label: 'Blocked Drainage',
            rows: 3,
            defaultValue: 'No concerns associated with blocked waste water drains were observed by or reported to the NDDS assessor.',
            quickOptions: null,
        },
        {
            id:'inadequate-hot-water',
            type: 'textarea',
            label: 'Inadequate Hot Water',
            rows: 3,
            defaultValue: 'No concerns associated with the quantity or quality of the hot water supply were observed by or reported to the NDDS assessor.',
            quickOptions: null,
        },
        {
            id:'other-concerns',
            type: 'textarea',
            label: 'Other',
            rows: 3,
            defaultValue: 'No additional concerns relating to the plumbing system at the Subject Property were noted by or reported to the NDDS assessor.',
            quickOptions: null,
        }
    ],
    //recommendations block
    recommendations: [
        {
            id:'recommendations',
            type: 'textarea',
            label: 'Recommendations',
            rows: 4,
            defaultValue: '',
            placeholder: 'Or make other site specific recommendation...',
            quickOptions: [
                {
                    label: 'No replacement / water heaters in reserve',
                    text: 'No significant replacement of the supply and waste lines is anticipated during the reserve term. These systems should be maintained as part of routine maintenance. Periodic replacement of water heaters is expected during the reserve term and an allowance for this replacement is included in the Capital Replacement Reserve Schedule.',
                },
                {
                    label: 'No replacement / water heaters tenant responsibility',
                    text: 'No significant replacement of the supply and waste lines is anticipated during the reserve term. These systems should be maintained as part of routine maintenance. Periodic replacement of water heaters is expected during the reserve term; however, this is a tenant responsibility and no costs for this replacement are included in the Capital Replacement Reserve Schedule.',
                },
                {
                    label: 'No replacement / boiler overhaul anticipated',
                    text: 'No significant replacement of the supply and waste lines is anticipated during the reserve term. These systems should be maintained as part of routine maintenance. Based on the age of the boiler system it is anticipate that the boiler will need to either be replaced or overhauled during the reserve term and an allowance for this work is included in the Capital Replacement Reserve Schedule.',
                },
            ],
        }
    ]
}

//sec 7.4 elevators and escalators

export const elevatorsAndEscalators = {
    //description block
    description: [
        {
            id:'elevators',
            type:'textarea',
            label:'Elevators',
            rows:2,
            defaultValue:'',
            placeholder:'Describe the number, type, brand, age, capacity, etc...',
            quickOptions: [
                {
                    label: 'No elevators present',
                    text: 'No elevators are present at the Subject Property.',
                },
            ],
        },
        {
            id:'escalators',
            type:'textarea',
            label:'Escalators',
            rows:2,
            defaultValue:'',
            placeholder:'Describe the number, type, age, capacity, etc...',
            quickOptions: [
                {
                    label: 'No escalators present',
                    text: 'No escalators are present at the Subject Property.',
                },
            ],
        },
        {
            id:'other-vertical-transport',
            type:'textarea',
            label:'Other',
            rows:2,
            defaultValue:'',
            placeholder:'Describe the number, type, age, capacity, etc...',
            quickOptions: [
                {
                    label: 'No other vertical transport',
                    text: 'No other significant lifts or mechanical forms of vertical transport systems were noted at the Subject Property.',
                },
            ],
        }
    ],
    //observations block
    observations: [
        {
            id:'general-condition',
            type:'condition-selector',
            label:'General Condition',
            options: ['Good', 'Fair', 'Poor', 'Not Applicable'],
        },
        {
            id:'age-lastaction',
            type:'textarea',
            label:'Age / Last Action',
            rows:3,
            defaultValue:'',
            placeholder:'Describe the last major repair or action...',
            quickOptions: [
                {
                    label: 'No elevators/escalators to maintain',
                    text: 'There are no elevators or escalators to maintain.',
                },
                {
                    label: 'Original / service contract',
                    text: 'The equipment is original and is maintained under a service contract.',
                },
                {
                    label: 'Original / as-needed repairs',
                    text: 'The equipment is original. Repairs and replacement of parts is handled on an as needed basis.',
                },
            ],
        }
    ],
    //concerns block
    concerns: [
        {
            id:'inoperable-equipment',
            type: 'textarea',
            label: 'Inoperable Equipment',
            rows: 3,
            defaultValue: '',
            placeholder: 'Describe the location and extent of concern...',
            quickOptions: [
                {
                    label: 'No elevators/escalators present',
                    text: 'No elevators or escalators are present at the Subject Property.',
                },
                {
                    label: 'All operational / no problems reported',
                    text: 'All of the elevators appeared to be operational at the time of the assessment. No problems regarding the elevators were reported to the NDDS assessor.',
                },
            ],
        },
        {
            id:'out-of-date-inspection',
            type: 'textarea',
            label: 'Out-of-Date Inspection',
            rows: 3,
            defaultValue: '',
            placeholder: 'Describe the date the inspection certificates expired...',
            quickOptions: [
                {
                    label: 'No elevators/escalators present',
                    text: 'No elevators or escalators are present at the Subject Property.',
                },
                {
                    label: 'Inspection certificates current',
                    text: 'The inspection certificates for the elevators was current.',
                },
            ],
        },
        {
            id:'other-concerns',
            type: 'textarea',
            label: 'Other',
            rows: 3,
            defaultValue: '',
            placeholder: 'Describe location and extent of concern...',
            quickOptions: [
                {
                    label: 'No elevators/escalators present',
                    text: 'No elevators or escalators are present at the Subject Property.',
                },
                {
                    label: 'No other concerns',
                    text: 'No other concerns regarding the elevators at the Subject Property were noted by or reported to the NDDS assessor.',
                },
            ],
        }
    ],
    //recommendations block
    recommendations: [
        {
            id:'recommendations',
            type: 'textarea',
            label: 'Recommendations',
            rows: 4,
            defaultValue: '',
            placeholder: 'Make other site specific recommendation...',
            quickOptions: [
                {
                    label: 'No elevators/escalators present',
                    text: 'No elevators or escalators are present at the Subject Property.',
                },
                {
                    label: 'Service contract / not in reserve',
                    text: 'The elevators are maintained under an annual service contract that includes all necessary repairs and replacement. Allowances for this work, therefore, are not included in the Capital Replacement Reserve Schedule.',
                },
                {
                    label: 'Major overhaul anticipated (EUL 20-25 years)',
                    text: 'Elevators typically need annual service, which is considered a routine maintenance item, and a major overhaul every 20 to 25 years. Based on the age of the elevators, it is anticipated that a major overhaul will be required during the reserve term and an allowance for this work is included in the Capital Replacement Reserve Schedule.',
                },
            ],
        }
    ]
}

//SECTION 8.0 - INTERIOR ELEMENTS

//sec 8.1 - common areas

export const commonAreas = {
    //description block
    description: [
        {
            id:'interior-finishes',
            type:'textarea',
            label:'Interior Finishes',
            rows:3,
            defaultValue:'',
            placeholder:'Describe what common areas, such as lobbies, hallways and restrooms, are present and the typical wall, ceiling and floor finishes...',
            quickOptions: [
                {
                    label: 'Single tenant / no common areas',
                    text: 'The facility is a single tenant facility. No common areas are present.',
                },
            ],
        }
    ],
    //observations block
    observations: [
        {
            id:'general-condition',
            type:'condition-selector',
            label:'General Condition',
            options: ['Good', 'Fair', 'Poor', 'Not Applicable'],
        },
        {
            id:'age-lastaction',
            type:'textarea',
            label:'Age / Last Action',
            rows:3,
            defaultValue:'',
            placeholder:'Describe the last major renovation of common areas...',
            quickOptions: [
                {
                    label: 'Finishes are original',
                    text: 'The common area finishes are original.',
                },
                {
                    label: 'No common areas',
                    text: 'There are no common areas at the Subject Property.',
                },
            ],
        }
    ],
    //concerns block
    concerns: [
        {
            id:'damaged-walls-ceilings',
            type: 'textarea',
            label: 'Damaged Walls/Ceilings',
            rows: 3,
            defaultValue: '',
            placeholder: 'Discuss the location and extent of concern...',
            quickOptions: [
                {
                    label: 'No significant damage',
                    text: 'No significant damage to the walls and ceilings of the common areas was noted during the assessment.',
                },
                {
                    label: 'No common areas',
                    text: 'There are no common area at the Subject Property.',
                },
            ],
        },
        {
            id:'damaged-worn-flooring',
            type: 'textarea',
            label: 'Damaged/Worn Flooring',
            rows: 3,
            defaultValue: '',
            placeholder: 'Discuss the location and extent of concern...',
            quickOptions: [
                {
                    label: 'Good condition / no damage',
                    text: 'The common area floors were generally in good condition with no significant areas of damage or wear observed.',
                },
                {
                    label: 'No common areas',
                    text: 'There are no common area at the Subject Property.',
                },
            ],
        },
        {
            id:'other-concerns',
            type: 'textarea',
            label: 'Other',
            rows: 3,
            defaultValue: '',
            placeholder: 'Discuss the location and extent of concern...',
            quickOptions: [
                {
                    label: 'No other concerns',
                    text: 'No other concerns relating to the interior finishes of the common areas were noted by or reported to the NDDS assessor.',
                },
                {
                    label: 'No common areas',
                    text: 'There are no common area at the Subject Property.',
                },
            ],
        }
    ],
    //recommendations block
    recommendations: [
        {
            id:'recommendations',
            type: 'textarea',
            label: 'Recommendations',
            rows: 4,
            defaultValue: '',
            placeholder: 'Make other site specific recommendations...',
            quickOptions: [
                {
                    label: 'Routine maintenance / flooring replacement in reserve',
                    text: 'Interior common area finishes, such was walls and ceilings, can be repaired and painted as needed as part of the routine maintenance of the property. Periodic replacement of vinyl flooring and carpeting is anticipated during the reserve term and an allowance for this replacement has been included in the Capital Replacement Reserve Schedule.',
                },
                {
                    label: 'Updating anticipated / in reserve',
                    text: 'The common areas will need most likely require updating during the reserve term. NDDS has included an allowance for the updating of the common area finishes in the Capital Replacement Reserve Schedule.',
                },
            ],
        }
    ]
}

//sec 8.2 - tenant spaces

export const tenantSpaces = {
    equipmentList: {
        label: 'Tenant Spaces / Guest Rooms',
        fields: [],
        modes: [
            {
                id: 'tenant-spaces',
                label: 'Tenant Spaces',
                fields: [
                    { id: 'space-id', label: 'Space ID', placeholder: 'e.g. Suite 101' },
                    { id: 'sqft', label: 'Square Footage', placeholder: 'SF' },
                    { id: 'tenant', label: 'Tenant', placeholder: 'Tenant name', width: 'flex-[2]' },
                    { id: 'occupied', label: 'Occupied', type: 'checkbox' as const },
                    { id: 'condition-notes', label: 'Condition Notes', placeholder: 'Notes...', width: 'flex-[2]' },
                ],
            },
            {
                id: 'guest-rooms',
                label: 'Guest Rooms',
                fields: [
                    { id: 'room-number', label: 'Guest Room #', placeholder: 'e.g. 101' },
                    { id: 'condition-notes', label: 'Condition Notes', placeholder: 'Notes...', width: 'flex-[3]' },
                ],
            },
        ],
    },
    //description block
    description: [
        {
            id:'interior-finishes',
            type:'textarea',
            label:'Interior Finishes',
            rows:4,
            defaultValue:'',
            placeholder:'Describe the interior finishes in detail...',
            quickOptions: [
                {
                    label: 'Commercial tenant spaces',
                    text: 'The interiors of the tenant spaces are finished out to meet the needs of the individual tenant spaces. Generally speaking, the walls are painted or wallpapered gypsum board, the ceilings are suspended systems with either 2\'x2\' or 2\'x4\' lay-in panels and the floors are a mixture of carpeting, vinyl floor tile and vinyl sheet flooring.',
                },
                {
                    label: 'Living units',
                    text: 'The interiors of the living units consist of painted gypsum board walls and ceilings. The flooring was a mixture of carpet, vinyl tile and vinyl sheet flooring.',
                },
            ],
        }
    ],
    //observations block
    observations: [
        {
            id:'general-condition',
            type:'condition-selector',
            label:'General Condition',
            options: ['Good', 'Fair', 'Poor'],
        },
        {
            id:'age-lastaction',
            type:'textarea',
            label:'Age / Last Action',
            rows:4,
            defaultValue:'',
            placeholder:'Describe the last major tenant area repair or action...',
            quickOptions: [
                {
                    label: 'Finishes are original',
                    text: 'The interior finishes in the tenant areas are original.',
                },
                {
                    label: 'Replaced as needed / tenant make-ready',
                    text: 'The interior finishes in the tenant areas are replaced as need on an ongoing basis. The areas are usually addressed as part of the tenant make-ready between tenants. Painting of walls and ceilings is generally handled as part of routine maintenance, while flooring is replaced as needed.',
                },
                {
                    label: 'TI allowance / tenant responsibility',
                    text: 'Interior finishes are handled as part of the tenant improvement (TI) allowances negotiated as part of the lease or by the tenant during the lease. Once the TI is completed, any repairs or replacement are generally the responsibility of the tenant.',
                },
            ],
        }
    ],
    //concerns block
    concerns: [
        {
            id:'damaged-walls-ceilings',
            type: 'textarea',
            label: 'Damaged Walls/Ceilings',
            rows: 3,
            defaultValue: '',
            placeholder: 'Discuss the location and extent of concern...',
            quickOptions: [
                {
                    label: 'No significant damage',
                    text: 'No significant damage to the walls and ceilings of the tenant areas was noted during the assessment.',
                },
            ],
        },
        {
            id:'damaged-worn-flooring',
            type: 'textarea',
            label: 'Damaged/Worn Flooring',
            rows: 3,
            defaultValue: '',
            placeholder: 'Discuss the location and extent of concern...',
            quickOptions: [
                {
                    label: 'Good condition / no damage',
                    text: 'The flooring in the tenant spaces was generally in good condition with no significant areas of damage or wear observed.',
                },
                {
                    label: 'Living units fair to excellent',
                    text: 'The flooring in the living units ranged from fair to excellent.',
                },
            ],
        },
        {
            id:'other-concerns',
            type: 'textarea',
            label: 'Other',
            rows: 3,
            defaultValue: '',
            placeholder: 'Discuss the location and extent of concern...',
            quickOptions: [
                {
                    label: 'No other concerns',
                    text: 'No other concerns relating to the interior finishes of the common areas were noted by or reported to the NDDS assessor.',
                },
                {
                    label: 'No common areas',
                    text: 'There are no common area at the Subject Property.',
                },
            ],
        }
    ],
    //recommendations block
    recommendations: [
        {
            id:'recommendations',
            type: 'textarea',
            label: 'Recommendations',
            rows: 4,
            defaultValue: '',
            placeholder: 'Make other site specific recommendation...',
            quickOptions: [
                {
                    label: 'Routine maintenance / flooring in reserve',
                    text: 'Tenant area finishes, such was walls and ceilings, can be repaired and painted as needed as part of the routine maintenance of the property. Periodic replacement of vinyl flooring and carpeting is anticipated during the reserve term and an allowance for this replacement has been included in the Capital Replacement Reserve Schedule.',
                },
                {
                    label: 'Tenant responsibility / not in reserve',
                    text: 'Interior finishes are the responsibility of the tenant and are either handled in the TI allowance negotiated as part of the lease or by the tenant during the term of the lease. Therefore, no allowance for tenant area finishes have been included in the Capital Replacement Reserve Schedule.',
                },
            ],
        }
    ]
}

//SECTION 9.0 - LIFE SAFETY/FIRE PROTECTION

//sec 9.1 - sprinklers and standpipes

export const sprinklersAndStandpipes = {
    //description block
    description: [
        {
            id:'fire-sprinklers-standpipes',
            type:'textarea',
            label:'Fire Sprinklers and Standpipes',
            rows:3,
            defaultValue:'',
            placeholder:'Describe the sprinkler system in detail...',
            quickOptions: [
                {
                    label: 'No fire sprinkler system',
                    text: 'No fire sprinkler system is present at the Subject Property.',
                },
                {
                    label: 'Fully fire sprinklered',
                    text: 'The Subject Property is fully fire sprinklered.',
                },
            ],
        }
    ],
    //observations block
    observations: [
        {
            id:'general-condition',
            type:'condition-selector',
            label:'General Condition',
            options: ['Good', 'Fair', 'Poor'],
        },
        {
            id:'age-lastaction',
            type:'textarea',
            label:'Age / Last Action',
            rows:3,
            defaultValue:'',
            placeholder:'Describe the last major repair or action...',
            quickOptions: [
                {
                    label: 'Not fire sprinklered',
                    text: 'The Subject Property is not fire sprinklered.',
                },
                {
                    label: 'Original / routine maintenance',
                    text: 'The fire sprinkler system is original and is maintained as part of the routine maintenance of the facility.',
                },
            ],
        }
    ],
    //concerns block
    concerns: [
        {
            id:'inoperable-equipment',
            type: 'textarea',
            label: 'Inoperable Equipment',
            rows: 3,
            defaultValue: '',
            placeholder: 'Discuss the location and extent of concern...',
            quickOptions: [
                {
                    label: 'No fire sprinkler systems',
                    text: 'There are no fire sprinkler systems at the Subject Property.',
                },
                {
                    label: 'No indications of inoperable equipment',
                    text: 'There was no obvious visual indications of inoperable fire sprinkler equipment. According to the property contact, the system is fully operable.',
                },
            ],
        },
        {
            id:'insufficient-water-pressure',
            type: 'textarea',
            label: 'Insufficient Water Pressure',
            rows: 3,
            defaultValue: '',
            quickOptions: [
                {
                    label: 'No fire sprinkler systems',
                    text: 'There are no fire sprinkler systems at the Subject Property.',
                },
                {
                    label: 'Water pressure sufficient',
                    text: 'According to the property contact, the water pressure at the Subject Property is sufficient to operate the fire sprinkler system.',
                },
            ],
        },
        {
            id:'out-of-date-inspections',
            type: 'textarea',
            label: 'Out-of-Date Inspections',
            rows: 3,
            defaultValue: '',
            placeholder: 'Describe location and extent of concern...',
            quickOptions: [
                {
                    label: 'No fire sprinkler systems',
                    text: 'There are no fire sprinkler systems at the Subject Property.',
                },
                {
                    label: 'Inspection certificates current',
                    text: 'NDDS reviewed the inspection certificates for the fire sprinkler system and found them to be current.',
                },
            ],
        },
        {
            id:'recalled-sprinkler-heads',
            type: 'textarea',
            label: 'Recalled Sprinkler Heads',
            rows: 4,
            defaultValue: '',
            quickOptions: [
                {
                    label: 'No fire sprinkler systems',
                    text: 'There are no fire sprinkler systems at the Subject Property.',
                },
                {
                    label: 'Inspected / none involved in recall',
                    text: 'Over the years, there have been extensive recalls of sprinkler heads manufactured by Central, Omega and Star. Some of these sprinklers could either fail in a fire, or trigger unexpectedly. According to property management, the sprinkler heads at the property were inspected and none of the sprinkler heads were involved in a recall.',
                },
                {
                    label: 'Not aware of inspection',
                    text: 'Over the years, there have been extensive recalls of sprinkler heads manufactured by Central, Omega and Star. Some of these sprinklers could either fail in a fire, or trigger unexpectedly. Property management was not aware of any inspection conducted at the Subject Property to determine if the sprinkler heads present were involved in any of these recalls.',
                },
            ],
        },
        {
            id:'other-concerns',
            type: 'textarea',
            label: 'Other',
            rows: 3,
            defaultValue: '',
            placeholder: 'Describe location and extent of concern...',
            quickOptions: [
                {
                    label: 'No fire sprinkler systems',
                    text: 'There are no fire sprinkler systems at the Subject Property.',
                },
                {
                    label: 'No additional concerns',
                    text: 'No additional concerns relating to the sprinkler system at the Subject Property were noted by or reported to NDDS\'s assessor.',
                },
            ],
        }
    ],
    //recommendations block
    recommendations: [
        {
            id:'recommendations',
            type: 'textarea',
            label: 'Recommendations',
            rows: 5,
            defaultValue: '',
            placeholder: 'Make other site specific recommendation...',
            quickOptions: [
                {
                    label: 'No fire sprinkler systems',
                    text: 'There are no fire sprinkler systems at the Subject Property.',
                },
                {
                    label: 'No major overhaul / routine maintenance',
                    text: 'No major overhaul or replacement of the fire sprinkler system is anticipated during the reserve term. The system should continue to be maintained as part of the routine maintenance of the facility.',
                },
                {
                    label: 'Inspect for recalled heads',
                    text: 'It may be prudent for property management to have a fire sprinkler company inspect the sprinkler heads to determine if the heads used were involved in one of the major recalls or contact the Central sprinkler-head replacement program at (800) 871-3492, or http://www.sprinklerreplacement.com. Central will provide an information packet detailing which sprinkler heads (including Central, Omega and Star brands) that are involved in the voluntary recall program. In the event sprinkler heads at the property are involved, property management should check the status of the recall program. It is possible that the affected sprinkler heads will be replaced through the sprinkler head replacement program at no cost to the Subject Property. This work should be conducted as part of routine maintenance and no costs are included in either the Deferred Maintenance or Capital Replacement Reserve Schedules.',
                },
            ],
        }
    ]
}

//sec 9.2 - alarm systems

export const alarmSystems = {
    //description block
    description: [
        {
            id:'fire-alarm-systems',
            type:'textarea',
            label:'Fire Alarm Systems',
            rows:3,
            defaultValue:'',
            placeholder:'Describe the fire alarm system in detail...',
            quickOptions: null,
        },
        {
            id:'other-systems',
            type:'textarea',
            label:'Other Systems',
            rows:3,
            defaultValue:'',
            placeholder:'Describe any other fire systems in detail...',
            quickOptions: null,
        }
    ],
    //observations block
    observations: [
        {
            id:'general-condition',
            type:'condition-selector',
            label:'General Condition',
            options: ['Good', 'Fair', 'Poor', 'Not Applicable'],
        },
        {
            id:'age-lastaction',
            type:'textarea',
            label:'Age / Last Action',
            rows:3,
            defaultValue:'',
            placeholder:'Describe the last major repair or action...',
            quickOptions: [
                {
                    label: 'No alarm systems present',
                    text: 'No fire, security or other alarm systems were present at the Subject Property.',
                },
                {
                    label: 'Original / routine maintenance',
                    text: 'The alarm systems at the Subject Property are original and are maintained as part of the routine maintenance of the facility.',
                },
                {
                    label: 'Battery operated smoke detectors',
                    text: 'The battery operated smoke detectors are of various ages. Batteries are replaced on a periodic basis and non-functioning units are replaced on an as needed basis. This work is done as part of routine maintenance.',
                },
            ],
        }
    ],
    //concerns block
    concerns: [
        {
            id:'inoperable-equipment',
            type: 'textarea',
            label: 'Inoperable Equipment',
            rows: 3,
            defaultValue: '',
            placeholder: 'Discuss the location and extent of concern...',
            quickOptions: [
                {
                    label: 'No additional life safety systems',
                    text: 'No additional property-owned life safety or fire protection systems were present at the Subject Property.',
                },
                {
                    label: 'System operable / no inoperable equipment',
                    text: 'The system appeared operable at the time of the assessment. No inoperable equipment was reported to the NDDS assessor.',
                },
            ],
        },
        {
            id:'other-concerns',
            type: 'textarea',
            label: 'Other',
            rows: 3,
            defaultValue: '',
            placeholder: 'Describe location and extent of concern...',
            quickOptions: [
                {
                    label: 'No additional life safety systems',
                    text: 'No additional property-owned life safety or fire protection systems were present at the Subject Property.',
                },
                {
                    label: 'No additional concerns',
                    text: 'No additional concerns relating to the system were noted by or reported to NDDS\'s assessor.',
                },
            ],
        }
    ],
    //recommendations block
    recommendations: [
        {
            id:'recommendations',
            type: 'textarea',
            label: 'Recommendations',
            rows: 4,
            defaultValue: '',
            placeholder: 'Make other site specific recommendation...',
            quickOptions: [
                {
                    label: 'No additional life safety systems',
                    text: 'No additional property-owned life safety or fire protection systems were present at the Subject Property.',
                },
                {
                    label: 'No major overhaul / routine maintenance',
                    text: 'No major overhaul or replacement of the system is anticipated during the reserve term. The system should continue to be maintained as part of the routine maintenance of the facility.',
                },
            ],
        }
    ]
}

//sec 10 ADDITIONAL CONSIDERATIONS

// SEC 10.1 Natural Hazards

export const naturalHazards = {
    //description block
    description: [
        {
            id:'seismic-zone',
            type:'text',
            label:'Seismic Zone',
            placeholder:'Zone: ',
        },
        {
            id:'flood-plain-designation',
            type:'text',
            label:'Flood Plain Designation',
            placeholder:'X',
        },
        {
            id:'flood-plain-source',
            type:'textarea',
            label:'Flood Plain Source',
            rows: 2,
            defaultValue: 'Federal Emergency Management Agency (FEMA), Flood Insurance Rate Map (FIRM) Panel No. XXXX dated XXX',
            quickOptions: null,
        },
        {
            id:'wind-zone',
            type:'text',
            label:'Wind Zone',
            placeholder:'Wind Zone: III',
        },
        {
            id:'hurricane-susceptible',
            type:'boolean-select',
            label:'Hurricane Susceptible Region',
            options: [
                { value: 'yes', label: 'Yes', text: 'The Subject Property is located in a Hurricane Susceptible Region.' },
                { value: 'no', label: 'No', text: 'The Subject Property is not located in a Hurricane Susceptible Region.' },
            ],
        },
    ],
    //observations block
    observations: [
        {
            id:'age-lastaction',
            type:'textarea',
            label:'Age / Last Action',
            rows:3,
            defaultValue:'No seismic or wind upgrades were noted or reported at the Subject Property. It is assumed that construction was completed in accordance with the codes applicable as of the date of construction.',
            quickOptions: null,
        }
    ],
    //concerns block
    concerns: [
        {
            id:'seismic-concerns',
            type: 'textarea',
            label: 'Seismic Concerns',
            rows: 4,
            defaultValue: '',
            quickOptions: [
                {
                    label: 'Not in elevated seismic zone',
                    text: 'Properties located in Zones 3 or 4 are considered potentially vulnerable to significant impact from earthquake activity. The Subject Property is not located in one of these zones.',
                },
                {
                    label: 'Located in elevated seismic zone',
                    text: 'Properties located in Zones 3 or 4 are considered potentially vulnerable to significant impact from earthquake activity. The Subject Property is located in one of these zones of elevated risk of seismic activity.',
                },
            ],
        },
        {
            id:'wind-or-hurricane-concerns',
            type: 'textarea',
            label: 'Wind or Hurricane Concerns',
            rows: 4,
            defaultValue: 'Properties located in high Wind Zones III or IV, a Special Wind Region or a Hurricane Susceptible Region are considered potentially more vulnerable to significant impact from wind and hurricanes (high wind, storm surge, etc).  The subject property is not located in any of these zones. Or The subject property is located in (note Zone or Region). ',
            quickOptions: null,
        },
    ],
    //recommendations block
    recommendations: [
        {
            id:'recommendations',
            type: 'textarea',
            label: 'Recommendations',
            rows: 5,
            defaultValue: '',
            placeholder: 'Or make site specific recommendations...',
            quickOptions: [
                {
                    label: 'No further seismic action recommended',
                    text: 'Given the seismic zone for the area including the Subject Property, no further action with regard to seismic risk is recommended at this time.',
                },
                {
                    label: 'PML assessment retained',
                    text: 'Given the seismic zone for the area including the Subject Property, NDDS was retained to conduct a Probable Maximum Loss (PML) assessment of the property. The PML assessment will be provided under separate cover.',
                },
                {
                    label: 'PML assessment recommended',
                    text: 'Given the seismic zone for the area including the Subject Property, NDDS recommends that a Probable Maximum Loss (PML) assessment of the property be conducted.',
                },
                {
                    label: 'Wind/hurricane protection may be required',
                    text: 'Based on the wind zone map reviewed, the subject property appears to be located in Zone, up to... Based on the wind zone map, the property is located within a high Wind Zones, a Special Wind Region, a Hurricane Susceptible Region. Therefore, wind/hurricane damage protection/insurance may be required.',
                },
                {
                    label: 'Flood plain review included',
                    text: 'Based on the flood map reviewed, a portion of the property is located within the 100-year flood plain. A current, site specific survey indicating the actual topographic elevations of the property, relative to the flood plain, in should be reviewed in conjunction with the site\'s architectural drawings indicating the elevation of the top of the finished building slabs, to determine if flood damage protection/insurance would be prudent. This review has been included in the Immediate Needs Table, but no cost has been assigned at this time.',
                },
            ],
        }
    ]
}

// SEC 10.2 Microbial Contamination (Mold)

export const microbialContamination = {
    //description block
    description: [
        {
            id:'mold-description',
            type:'textarea',
            label:'Description',
            rows:6,
            defaultValue:'A visual screening for suspect mold was conducted. The screening was limited to observations in the areas walked and should not be considered a comprehensive survey of the property. No sampling was conducted. No assessment or assessment behind walls or in any other generally inaccessible areas was performed. Inquiries were made of the owner and/or property manager regarding any knowledge of past and current leaks at the property, any known mold issues, and any tenant complaints regarding health problems, musty odors or water leaks. When applicable, areas of reported or likely water leaks or water intrusion/penetration were inspected.',
            quickOptions: null,
        }
    ],
    //observations/comments/concerns block
    observations: [
        {
            id:'mold-observations',
            type:'textarea',
            label:'Observations/Comments/Concerns',
            rows:3,
            defaultValue:'No significant indications of mold or water infiltration were noted by NDDS\'s assessor. No concerns relating to mold or water infiltration were reported to NDDS by property management or the tenants.',
            quickOptions: null,
        }
    ],
    //recommendations block
    recommendations: [
        {
            id:'recommendations',
            type: 'textarea',
            label: 'Recommendations',
            rows: 6,
            defaultValue: '',
            placeholder: 'Or make other site specific recommendation...',
            quickOptions: [
                {
                    label: 'No concerns / no action recommended',
                    text: 'No concerns relating to mold were identified during the assessment and no further action is recommended at this time.',
                },
                {
                    label: 'No concerns / MMP recommended',
                    text: 'No concerns relating to mold were identified during the assessment of the Subject Property. As a proactive, preventative measure, however, NDDS recommends that a Moisture Mitigation Program (MMP) be implemented at the Subject Property and has included costs for this in the Deferred Maintenance Table.',
                },
                {
                    label: 'Minor amounts / routine maintenance',
                    text: 'Minor amounts of mold were identified at the Subject Property. Consistent with USEPA, New York City Department of Health (NYCDOH) and National Multi Housing Council (NMHC) guidelines, property management should promptly identify and repair or remediate the source of the moisture infiltration/buildup supporting the mold growth. Any water damaged or mold impacted materials in those areas should be removed and replaced. Subsequent to addressing the moisture issue, the identified areas of mold should be properly cleaned and sanitized in accordance with EPA, NYCDOH and NMHC guidelines. Given the limited amount of area involved, this can be addressed as part of the routine maintenance of the property.',
                },
                {
                    label: 'Moderate amounts / reserve schedule',
                    text: 'Moderate amounts of mold were identified at the Subject Property. Consistent with USEPA, New York City Department of Health (NYCDOH) and National Multi Housing Council (NMHC) guidelines, property management should promptly identify and repair or remediate the source of the moisture infiltration/buildup supporting the mold growth. Any water damaged or mold impacted materials in those areas should be removed and replaced. Subsequent to addressing the moisture issue, the identified areas of mold should be properly cleaned and sanitized in accordance with EPA, NYCDOH and NMHC guidelines. NDDS anticipates a major overhaul of the building\'s water systems will be required during the reserve term and has included an allowance for this work in the Capital Replacement Reserve Schedule. Costs for some ongoing repairs and parts replacement for the HVAC system are also included in the table.',
                },
                {
                    label: 'Significant amounts / industrial hygienist',
                    text: 'Significant amounts of mold were identified at the Subject Property. Consistent with USEPA, New York City Department of Health (NYCDOH) and National Multi Housing Council (NMHC) guidelines, a certified industrial hygienist/environmental firm should be retained to properly remediate the identified areas of mold in accordance with EPA, NYCDOH and NMHC guidelines. NDDS anticipates a major overhaul of the building and the chiller/cooling tower systems will be required during the reserve term and has included an allowance for this work in the Capital Replacement Reserve Schedule. Costs for some ongoing repairs and parts replacement for the HVAC system are also included in the table.',
                },
                {
                    label: 'Proactive MMP plan',
                    text: 'This plan takes a proactive, preventative approach to reducing the potential for moisture-related damage and/or mold impact by ensuring the early identification and repair of potential problems.\n\nKey elements of the plan include:\n\n• Notification to tenants regarding the risks associated with moisture and mold, the actions they can take to mitigate these risks, and any corrective measures taken by management regarding moisture or mold.\n\n• Regularly scheduled and comprehensive inspections must be conducted by staff that has received appropriate training and all inspections must be documented. Staff should perform an inspection to monitor the property for signs of moisture, water damage or situations that may lead to conditions favorable for mold growth (e.g. faulty faucets, broken sprinkler heads at cast of turnover and when conducting other maintenance activities. Also be aware of situations such as carpet cleaning techniques, which may leave carpets too damp and at the risk of creating conditions favorable for mold growth. To the maximum extent possible ceiling tiles, apron wallboard, cardboard, dust liner, wood, carpet, paper, and other cellulose surfaces should be given careful attention during a visual inspection. Kitchens, bathrooms, appliances, and HVAC systems should also be scrutinized. All water intrusion and mold events must be responded to in a timely manner.\n\n• Leaky plumbing and leaks in the building envelope must be repaired as soon as possible. Watch for condensation and wet spots. Fix sources of moisture problems immediately. Clean and dry wet or damp spots within 48 hours.\n\n• Documented inspections of the HVAC system should be performed at least monthly and problems corrected as soon as possible. Improperly cooling HVAC systems, or improper use by the residents, can result in conditions of excessive humidity, which could lead to mold growth. Develop maintenance guidelines based on manufacturer\'s specifications for HVAC ventilation equipment (including appropriate settings, filter changes, and cleaning).\n\n• Prevent moisture due to condensation by increasing surface temperature or reducing the moisture level in air (humidity). To increase surface temperature, insulate or increase air circulation. To reduce the moisture level in air, repair leaks, increase ventilation (if outside air is cold and dry), or dehumidify (if outdoor air is warm and humid).\n\n• Maintain low indoor humidity, below 60% relative humidity (RH), ideally 30-50%, if possible.\n\n• Do not let foundations stay wet. Provide drainage and slope ground away from the foundation.',
                },
            ],
        }
    ]
}

// SEC 10.3 ADA Screening Checklist

import type { ChecklistConfig } from '@/types/section'

export const adaScreeningChecklist: ChecklistConfig = {
    categories: [
        {
            id: 'history',
            letter: 'A',
            title: 'History',
            questions: [
                { id: 'a-1', text: 'Has an ADA survey previously been completed for the subject property.' },
                { id: 'a-2', text: 'Have any ADA improvements been made to the subject property since original construction?' },
                { id: 'a-3', text: 'Has building ownership/management reported any ADA complaints or litigation?' },
            ],
        },
        {
            id: 'parking',
            letter: 'B',
            title: 'Parking',
            questions: [
                { id: 'b-1', text: 'Does the required number of standard ADA-designated spaces appear to be provided?' },
                { id: 'b-2', text: 'Does the required number of van-accessible designated spaces appear to be provided?' },
                { id: 'b-3', text: 'Are accessible spaces part of the shortest accessible route to an accessible building entrance?' },
                { id: 'b-4', text: 'Is a sign with the International Symbol of Accessibility at the head of each space?' },
                { id: 'b-5', text: 'Does each accessible space have an adjacent access aisle?' },
                { id: 'b-6', text: 'Do parking spaces and access aisles appear to be relatively level and without obstruction?' },
            ],
        },
        {
            id: 'exterior-route',
            letter: 'C',
            title: 'Exterior Accessible Route',
            questions: [
                { id: 'c-1', text: 'Is an accessible route present from public transportation stops and municipal sidewalks on the subject property?' },
                { id: 'c-2', text: 'Are curb cut ramps present at transitions through curbs on an accessible route?' },
                { id: 'c-3', text: 'Do the curb cut ramps appear to have the proper slope for all components?' },
                { id: 'c-4', text: 'Do ramps on an accessible route appear to have a compliant slope?' },
                { id: 'c-5', text: 'Do ramps on an accessible route appear to have a compliant length and width?' },
                { id: 'c-6', text: 'Do ramps on an accessible route appear to have compliant end and intermediate landings?' },
                { id: 'c-7', text: 'Do ramps on an accessible route appear to have compliant handrails?' },
            ],
        },
        {
            id: 'building-entrances',
            letter: 'D',
            title: 'Building Entrances',
            questions: [
                { id: 'd-1', text: 'Do a sufficient number of accessible entrances appear to be provided?' },
                { id: 'd-2', text: 'If the main entrance is not accessible, is an alternate accessible entrance provided?' },
                { id: 'd-3', text: 'Is signage provided indicating the location of alternate accessible entrances?' },
                { id: 'd-4', text: 'Do doors at accessible entrances appear to have compliant clear floor area on each side?' },
                { id: 'd-5', text: 'Do doors at accessible entrances appear to have compliant hardware?' },
                { id: 'd-6', text: 'Do doors at accessible entrances appear to have a compliant clear opening width?' },
                { id: 'd-7', text: 'Do pairs of accessible entrance doors in series appear to have the minimum clear space between them?' },
                { id: 'd-8', text: 'Do thresholds at accessible entrances appear to have a compliant height?' },
            ],
        },
        {
            id: 'interior-routes',
            letter: 'E',
            title: 'Interior Accessible Routes and Amenities',
            questions: [
                { id: 'e-1', text: 'Does an accessible route appear to connect with all public areas inside the building?' },
                { id: 'e-2', text: 'Do accessible routes appear free of obstructions and/or protruding objects?' },
                { id: 'e-3', text: 'Do ramps on accessible routes appear to have a compliant slope?' },
                { id: 'e-4', text: 'Do ramps on accessible routes appear to have a compliant length and width?' },
                { id: 'e-5', text: 'Do ramps on accessible routes appear to have compliant end and intermediate landings?' },
                { id: 'e-6', text: 'Do ramps on accessible routes appear to have compliant handrails?' },
                { id: 'e-7', text: 'Are adjoining public areas and areas of egress identified with accessible signage?' },
                { id: 'e-8', text: 'Do public transaction areas have an accessible, lowered counter section?' },
                { id: 'e-9', text: 'Do public telephones appear mounted with an accessible height and location?' },
                { id: 'e-10', text: 'Are publicly-accessible swimming pools equipped with an entrance lift?' },
            ],
        },
        {
            id: 'interior-doors',
            letter: 'F',
            title: 'Interior Doors',
            questions: [
                { id: 'f-1', text: 'Do doors at interior accessible routes appear to have compliant clear floor area on each side?' },
                { id: 'f-2', text: 'Do doors at interior accessible routes appear to have compliant hardware?' },
                { id: 'f-3', text: 'Do doors at interior accessible routes appear to have compliant opening force?' },
                { id: 'f-4', text: 'Do doors at interior accessible routes appear to have a compliant clear opening width?' },
            ],
        },
        {
            id: 'elevators',
            letter: 'G',
            title: 'Elevators',
            questions: [
                { id: 'g-1', text: 'Are hallway call buttons configured with the "UP" button above the "DOWN" button?' },
                { id: 'g-2', text: 'Is accessible floor identification signage present on the hoistway sidewalls?' },
                { id: 'g-3', text: 'Do the elevators have audible and visual arrival indicators at the entrances?' },
                { id: 'g-4', text: 'Do the elevator hoistway and car interior appear to have a minimum compliant clear floor area?' },
                { id: 'g-5', text: 'Do the elevator car doors have automatic re-opening devices to prevent closure on obstructions?' },
                { id: 'g-6', text: 'Do elevator car control buttons appear to be mounted at a compliant height?' },
                { id: 'g-7', text: 'Are tactile and Braille characters mounted to the left of each elevator car control button?' },
                { id: 'g-8', text: 'Are audible and visual floor position indicators provided in the elevator car?' },
                { id: 'g-9', text: 'Is the emergency call system at the base of the control panel and not require voice communication?' },
            ],
        },
        {
            id: 'toilet-rooms',
            letter: 'H',
            title: 'Toilet Rooms',
            questions: [
                { id: 'h-1', text: 'Do publicly-accessible toilet rooms appear to have a minimum compliant floor area?' },
                { id: 'h-2', text: 'Does the lavatory appear to be mounted at a compliant height and with compliant knee area?' },
                { id: 'h-3', text: 'Does the lavatory faucet have compliant handles?' },
                { id: 'h-4', text: 'Is the plumbing piping under lavatories configured to protect against contact?' },
                { id: 'h-5', text: 'Are grab bars provided at compliant locations around the toilet?' },
                { id: 'h-6', text: 'Do toilet stall doors appear to provide the minimum compliant clear width?' },
                { id: 'h-7', text: 'Do toilet stalls appear to provide the minimum compliant clear floor area?' },
                { id: 'h-8', text: 'Do urinals appear to be mounted at a compliant height and with compliant approach width?' },
                { id: 'h-9', text: 'Do accessories and mirrors appear to be mounted at a compliant height?' },
            ],
        },
        {
            id: 'hospitality-guestrooms',
            letter: 'L',
            title: 'Hospitality Guestrooms',
            questions: [
                { id: 'l-1', text: 'Does property management report the minimum required accessible guestrooms?' },
            ],
        },
    ],
}
