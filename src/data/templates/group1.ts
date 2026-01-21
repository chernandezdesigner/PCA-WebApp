// section 5.0 - Site 

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