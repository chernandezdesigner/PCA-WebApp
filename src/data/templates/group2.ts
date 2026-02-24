// SECTION 1.0 - SUMMARY

//sec 1.1 general description

export const generalDescription = {
    introText: 'At the request of Client, NDDS has performed a Property Condition Assessment (PCA) of the property located at Property Address, City State, herein referred to as the Subject Property. Salient property details are as follows:',
    
    fields: [
        {
            id: 'property-name',
            type: 'text',
            label: 'Property Name',
            placeholder: 'Enter property name...',
        },
        {
            id: 'property-address',
            type: 'text',
            label: 'Property Address',
            placeholder: 'Enter property address...',
        },
        {
            id: 'city',
            type: 'text',
            label: 'City',
            placeholder: 'Enter city...',
        },
        {
            id: 'state',
            type: 'text',
            label: 'State',
            placeholder: 'Enter state...',
        },
        {
            id: 'zip',
            type: 'text',
            label: 'Zip',
            placeholder: 'Enter zip...',
        },
        {
            id: 'property-use',
            type: 'text',
            label: 'Property Use',
            placeholder: 'Enter property use...',
        },
        {
            id: 'number-of-buildings',
            type: 'text',
            label: 'Number of Buildings',
            placeholder: 'Enter number of buildings...',
        },
        {
            id: 'number-of-stories',
            type: 'text',
            label: 'Number of Stories',
            placeholder: 'Enter number of stories...',
        },
        {
            id: 'list-individual-buildings',
            type: 'conditional',
            condition: {
                field: 'number-of-buildings',
                value: ['', '0', '1'],
            },
            showWhen: false,
            innerField: {
                id: 'list-individual-buildings',
                type: 'boolean-select',
                label: 'List individual building details?',
                options: [
                    { value: 'yes', label: 'Yes', text: 'Record details for each building individually' },
                    { value: 'no', label: 'No', text: 'Not needed for this assessment' },
                ],
            },
        },
        {
            id: 'building-details',
            type: 'conditional',
            condition: {
                field: 'list-individual-buildings',
                value: 'yes',
            },
            showWhen: true,
            innerField: {
                id: 'building-details',
                type: 'dynamic-table',
                label: 'Individual Building Details',
                columns: [
                    { id: 'building-id', label: 'Building ID', placeholder: 'Bldg A' },
                    { id: 'address', label: 'Address', placeholder: 'Address', width: 'flex-[2]' },
                    { id: 'rentable-sf', label: 'Rentable SF', placeholder: 'SF' },
                    { id: 'stories', label: 'Stories', placeholder: '#' },
                    { id: 'date-constructed', label: 'Date of Construction', placeholder: 'YYYY' },
                ],
            },
        },
        {
            id: 'year-constructed',
            type: 'text',
            label: 'Year Constructed',
            placeholder: 'Enter year constructed...',
            sourceLabel: 'Source:',
            sourcePlaceholder: 'County Assessor',
        },
        {
            id: 'number-of-parcels',
            type: 'text',
            label: 'Number of Parcels',
            placeholder: 'Enter number of parcels...',
            sourceLabel: 'Source:',
            sourcePlaceholder: 'Enter source...',
        },
        {
            id: 'total-acreage',
            type: 'text',
            label: 'Total Acreage',
            placeholder: 'Enter total acreage...',
            sourceLabel: 'Source:',
            sourcePlaceholder: 'Enter source...',
        },
        {
            id: 'dwelling-units-beds',
            type: 'text',
            label: 'Dwelling Units/Beds',
            placeholder: 'Enter dwelling units/beds...',
            sourceLabel: 'Source:',
            sourcePlaceholder: 'Rent Roll',
        },
        {
            id: 'commercial-units',
            type: 'text',
            label: 'Commercial Units',
            placeholder: 'Enter commercial units...',
            sourceLabel: 'Source:',
            sourcePlaceholder: 'Enter source...',
        },
        {
            id: 'gross-building-area',
            type: 'text',
            label: 'Gross Building Area',
            placeholder: 'Enter gross building area...',
            sourceLabel: 'Source:',
            sourcePlaceholder: 'Enter source...',
        },
        {
            id: 'net-rentable-area',
            type: 'text',
            label: 'Net Rentable Area',
            placeholder: 'Enter net rentable area...',
            sourceLabel: 'Source:',
            sourcePlaceholder: 'Rent roll',
        },
        {
            id: 'parking-paving',
            type: 'text',
            label: 'Parking/Paving',
            placeholder: 'Describe paving...',
            additionalFields: [
                { id: 'num-spaces', placeholder: '# Spaces' },
                { id: 'num-ada-spaces', placeholder: '# ADA Spaces' },
            ],
        },
        {
            id: 'foundation-systems',
            type: 'text',
            label: 'Foundation Systems',
            placeholder: 'concrete slab on grade',
        },
        {
            id: 'structural-systems',
            type: 'text',
            label: 'Structural Systems',
            placeholder: 'wood framed',
        },
        {
            id: 'roofing-systems',
            type: 'text',
            label: 'Roofing Systems',
            placeholder: 'pitched and covered with asphalt architectural shingles',
        },
        {
            id: 'hvac-systems',
            type: 'text',
            label: 'HVAC Systems',
            placeholder: 'split systems',
        },
        {
            id: 'fire-suppression',
            type: 'text',
            label: 'Fire Suppression',
            placeholder: 'wet system',
        },
        {
            id: 'fire-alarms',
            type: 'text',
            label: 'Fire Alarms',
            placeholder: 'Enter fire alarm details...',
        },
    ]
}

//sec 1.2 general physical condition

export const generalPhysicalCondition = {
    fields: [
        {
            id: 'general-condition',
            type: 'condition-selector',
            label: 'General Condition',
            options: ['Poor', 'Fair', 'Good'],
        },
        {
            id: 'level-of-maintenance',
            type: 'condition-selector',
            label: 'Level of Maintenance',
            options: ['Poor', 'Fair', 'Good'],
        },
        {
            id: 'estimated-remaining-useful-life',
            type: 'textarea',
            label: 'Estimated Remaining Useful Life',
            rows: 2,
            placeholder: '30 to 35 years (if less than 15 years old subtract age from 45 to 50 years)',
        },
        {
            id: 'recent-capital-improvements',
            type: 'repeating-text',
            label: 'Recent Capital Improvements',
            dynamic: true,
            minItems: 5,
            itemPrefix: 'recent-improvement',
            itemPlaceholderTemplate: 'Identify improvement {n} and date',
            items: [
                { id: 'recent-improvement-1', placeholder: 'Identify improvement 1 and date' },
                { id: 'recent-improvement-2', placeholder: 'Identify improvement 2 and date' },
                { id: 'recent-improvement-3', placeholder: 'Identify improvement 3 and date' },
                { id: 'recent-improvement-4', placeholder: 'Identify improvement 4 and date' },
                { id: 'recent-improvement-5', placeholder: 'Identify improvement 5 and date' },
            ],
        },
        {
            id: 'planned-capital-improvements',
            type: 'repeating-text',
            label: 'Planned Capital Improvements',
            dynamic: true,
            minItems: 5,
            itemPrefix: 'planned-improvement',
            itemPlaceholderTemplate: 'Identify improvement {n} and date',
            items: [
                { id: 'planned-improvement-1', placeholder: 'Identify improvement 1 and date' },
                { id: 'planned-improvement-2', placeholder: 'Identify improvement 2 and date' },
                { id: 'planned-improvement-3', placeholder: 'Identify improvement 3 and date' },
                { id: 'planned-improvement-4', placeholder: 'Identify improvement 4 and date' },
                { id: 'planned-improvement-5', placeholder: 'Identify improvement 5 and date' },
            ],
        },
    ]
}

//sec 1.3 opinion of probable cost

export const opinionOfProbableCost = {
    fields: [
        {
            id: 'opinion-of-probable-cost',
            type: 'textarea',
            label: 'Opinion of Probable Cost',
            rows: 5,
            defaultValue: '',
            quickOptions: [
                {
                    label: 'No areas of physical deficiency identified',
                    text: 'Based on the walk-through survey of the Subject Property, interviews conducted and information obtained while conducting this PCA, no areas of physical deficiency or deferred maintenance, that would be considered outside of the normal on-going routine maintenance of a property, were identified.',
                },
                {
                    label: 'robable costs provided in Table 1',
                    text: 'Based on the walk-through of the Subject Property, interviews conducted and information obtained while conducting this PCA, NDDS\'s opinion of the probable cost to address area of physical deficiency or deferred maintenance, that would be considered outside the normal on-going routine maintenance of a property, are provided in Table 1- Opinion of Probable Costs to Remedy Physical Deficiencies - Deferred Maintenance Schedule in Appendix C of this report.',
                },
            ],
        },
    ]
}

// sec 1.5 - recommendations

export const recommendations = {
    fields: [
        {
            id: 'recommendations-text',
            type: 'textarea',
            label: 'Recommendations',
            rows: 6,
            quickOptions: [
                {
                    label: 'Deficiencies identified',
                    text: 'The following Physical Deficiency/Deferred Maintenance items were identified that would be considered outside of the normal on-going routine maintenance of a property. No additional assessment is recommended prior to finalizing opinion of probable costs to remedy physical deficiencies/deferred maintenance concerns at the Subject Property or to prepare the Capital Replacement Reserve Schedule.',
                },
                {
                    label: 'No additional assessment needed',
                    text: 'No other building components or systems were identified that would require additional assessment prior to providing the opinion of probable costs to remedy physical deficiencies/deferred maintenance concerns at the Subject Property or to prepare the Capital Replacement Reserve Schedule.',
                },
                {
                    label: 'Additional costs possible',
                    text: 'Upon completion of the additional assessment recommended, it is possible that additional costs will be identified that will need to be included in either the opinion of probable cost to remedy physical deficiencies/deferred maintenance concerns at the Subject Property or in the Capital Replacement Reserve Schedule.',
                },
            ],
        },
        {
            id: 'physical-deficiency-items',
            type: 'conditional',
            condition: {
                field: 'recommendations-text',
                value: 'The following Physical Deficiency/Deferred Maintenance items were identified',
                mode: 'includes',
            },
            showWhen: true,
            innerField: {
                id: 'physical-deficiency-items',
                type: 'repeating-text',
                label: 'Physical Deficiency / Deferred Maintenance Items Identified',
                dynamic: true,
                minItems: 0,
                itemPrefix: 'deficiency',
                itemPlaceholderTemplate: 'Describe deficiency item {n}',
                items: [],
            },
        },
    ]
}

// Property Condition Summary table (follows transmittal letter in PDF)

export const propertyConditionSummary = {
    rows: [
        { id: '5-1', label: 'TOPOGRAPHY AND STORMWATER' },
        { id: '5-2', label: 'ACCESS AND EGRESS' },
        { id: '5-3', label: 'PAVING, CURBING, AND PARKING' },
        { id: '5-4', label: 'SIDEWALKS AND FLATWORK' },
        { id: '5-5', label: 'LANDSCAPING AND APPURTENANCES' },
        { id: '5-6', label: 'ANCILLARY STRUCTURES' },
        { id: '6-1', label: 'FOUNDATION' },
        { id: '6-2', label: 'BUILDING FRAME' },
        { id: '6-3', label: 'FACADES OR CURTAIN WALL' },
        { id: '6-4', label: 'ROOFING' },
        { id: '7-1', label: 'HVAC' },
        { id: '7-2', label: 'ELECTRICAL' },
        { id: '7-3', label: 'PLUMBING' },
        { id: '7-4', label: 'ELEVATORS AND ESCALATORS' },
        { id: '8-1', label: 'INTERIOR FINISHES COMMON AREAS' },
        { id: '8-2', label: 'INTERIOR FINISHES TENANT SPACES' },
        { id: '9-1', label: 'FIRE SPRINKLERS AND STANDPIPES' },
        { id: '9-2', label: 'ALARM SYSTEMS' },
        { id: '9-3', label: 'OTHER SYSTEMS' },
        { id: '10-1', label: 'NATURAL HAZARDS' },
        { id: '10-2', label: 'MOLD' },
        { id: '10-3', label: 'ADA' },
    ],
    conditionOptions: ['Good', 'Fair', 'Poor'],
    actionOptions: [
        { value: 'IR', label: 'Immediate Repair' },
        { value: 'ST', label: 'Short Term Repair' },
        { value: 'RR', label: 'Replacement Reserve' },
        { value: 'RM', label: 'Routine Maintenance' },
        { value: 'INV', label: 'Investigation is Recommended' },
        { value: 'NA', label: 'Not Applicable' },
    ],
}

// Opinion of Probable Cost tables (follows condition summary in PDF)

export const opinionOfProbableCostTable = {
    deficiencyColumns: [
        { id: 'item', label: 'Item', placeholder: 'Describe deficiency item...' },
        { id: 'immediate-cost', label: 'Immediate Costs', placeholder: '$0', isCurrency: true },
        { id: 'short-term-cost', label: 'Short-Term Costs', placeholder: '$0', isCurrency: true },
    ],
    reserveFields: [
        { id: 'total-uninflated-reserve', label: 'Total Uninflated Reserve', placeholder: '$0' },
        { id: 'annual-uninflated-cost-per-sf', label: 'Annual Uninflated Cost Per SF', placeholder: '$0' },
        { id: 'total-inflated-reserve', label: 'Total Inflated Reserve (2.5%)', placeholder: '$0' },
        { id: 'annual-inflated-cost-per-sf', label: 'Annual Inflated Cost Per SF (@2.5%)', placeholder: '$0' },
    ],
}


//SECTION 2.0 - INTRODUCTION

//sec 2.4 general property reconnaissance information

export const generalPropertyReconnaissanceInformation = {
    fields: [
        {
            id: 'date-of-assessment',
            type: 'text',
            label: 'Date of Assessment',
            placeholder: 'Month, Day Year',
        },
        {
            id: 'weather-conditions',
            type: 'text',
            label: 'Weather Conditions',
            placeholder: 'cloud cover, approximate temp, precipitation',
        },
        {
            id: 'assessor',
            type: 'textarea',
            label: 'Assessor',
            rows: 2,
            placeholder: 'Professional Assessor\'s Name',
            helperText: 'A copy of the Professional Assessor\'s qualifications is included in Appendix D.',
        },
        {
            id: 'property-contact-escort',
            type: 'text',
            label: 'Property Contact/Escort',
            placeholder: 'Provide Names and Titles, years with property',
        },
        {
            id: 'areas-accessed',
            type: 'textarea',
            label: 'Areas Accessed',
            rows: 2,
            placeholder: 'Describe areas accessed',
        },
        {
            id: 'limitations',
            type: 'textarea',
            label: 'Limitations',
            rows: 3,
            placeholder: 'Describe inaccessible areas and general limitations imposed by physical obstructions such as adjacent buildings, bodies of water, overgrown landscaping, vehicles covering parking areas, and limiting conditions such as snow or rain.',
        },
    ]
}





//SECTION 3.0 - PROPERTY CHARACTERISTICS

//sec 3.1 - location and description

export const locationAndDescription = {
    fields: [
        {
            id: 'location-description',
            type: 'textarea',
            label: 'Location and Description',
            rows: 4,
            placeholder: 'The Subject Property consists of an irregular parcel of land totaling #### acres. It is improved with one single-story building totaling #### net rentable square feet (SF). Surrounding grounds consist of asphalt-paved driveways and parking areas, cast in place concrete sidewalks and landscaped areas. If there is anything else of presence, add a sentence. At the time of the assessment, the Subject Property operated as ___.',
        },
        {
            id: 'provided-legal-description',
            type: 'boolean-select',
            label: 'Provided legal description of subject property?',
            options: [
                {
                    value: 'yes',
                    label: 'Yes',
                    text: 'A site diagram and Legal Description is provided in Appendix A of this report. Photographs of the Subject Property are provided in Appendix B.',
                },
                {
                    value: 'no',
                    label: 'No',
                    text: 'A site diagram is provided in Appendix A of this report. Photographs of the Subject Property are provided in Appendix B. NDDS was not provided a Legal Description of the Subject Property.',
                },
            ],
        },
    ]
}

//sec 3.2 - tenant and lease information

export const tenantAndLeaseInformation = {
    fields: [
        {
            id: 'tenants',
            type: 'textarea',
            label: 'Tenants',
            rows: 4,
            defaultValue: '',
            quickOptions: [
                {
                    label: 'Single-tenant facility',
                    text: 'The Subject Property is a single-tenant facility and is occupied by ___.',
                },
                {
                    label: 'Multi-tenant facility',
                    text: 'The Subject Property is a multi-tenant facility. A rent roll is provided in Appendix E.',
                },
                {
                    label: 'Occupied by the following',
                    text: 'The Subject Property is occupied by the following:\nTenant\nTenant',
                },
            ],
        },
        {
            id: 'lease-information',
            type: 'textarea',
            label: 'Lease Information',
            rows: 4,
            defaultValue: '',
            quickOptions: [
                {
                    label: 'Single tenant lease reviewed',
                    text: 'NDDS reviewed the lease for the single tenant facility. According to the lease, the tenant is responsible for ___ and the landlord is responsible for ___.',
                },
                {
                    label: 'Representative leases reviewed',
                    text: 'NDDS reviewed representative tenant leases for the Subject Property. Based on the leases reviewed, the tenants are responsible for ___ and the landlord is responsible for ___.',
                },
                {
                    label: 'No lease provided for review',
                    text: 'NDDS was not provided a lease for review. According to ___, the tenants are responsible for ___ and the landlord is responsible for ___.',
                },
            ],
        },
    ]
}

//sec 3.3 - utility and service providers

export const utilityAndServiceProviders = {
    fields: [
        {
            id: 'portable-water',
            type: 'text',
            label: 'Portable Water',
            placeholder: 'Identify Utility',
        },
        {
            id: 'electricity',
            type: 'text',
            label: 'Electricity',
            placeholder: 'Identify Utility',
        },
        {
            id: 'natural-gas',
            type: 'text',
            label: 'Natural Gas',
            placeholder: 'Identify Utility',
        },
        {
            id: 'storm-water',
            type: 'text',
            label: 'Storm Water',
            placeholder: 'Identify Utility',
        },
        {
            id: 'sanitary-sewer',
            type: 'text',
            label: 'Sanitary Sewer',
            placeholder: 'Identify Utility',
        },
        {
            id: 'hvac-maintenance',
            type: 'text',
            label: 'HVAC Maintenance',
            placeholder: 'Identify service provider',
        },
        {
            id: 'fire-security',
            type: 'text',
            label: 'Fire/Security',
            placeholder: 'Identify service provider(s)',
        },
        {
            id: 'roof-maintenance',
            type: 'text',
            label: 'Roof Maintenance',
            placeholder: 'Identify service provider',
        },
        {
            id: 'special-utility-notes',
            type: 'textarea',
            label: 'Special Utility Systems',
            rows: 2,
            placeholder: 'Note any deficiencies, needs and/or any Special Utility Systems present',
        },
    ]
}

//SECTION 4.0 - DOCUMENT REVIEW AND INTERVIEWS

//sec 4.1 - property questionnaire

export const propertyQuestionnaire = {
    introText: 'NDDS requested that a property questionnaire be completed by someone familiar with the operation and maintenance of the facility. The questionnaire covered past and planned capital improvements, typical replacement costs, information from previous assessments and the description of any known or suspected issues of concern.',
    fields: [
        {
            id: 'questionnaire-status',
            type: 'textarea',
            label: 'Property Questionnaire',
            rows: 3,
            defaultValue: '',
            quickOptions: [
                {
                    label: 'Not provided',
                    text: 'A completed copy of the property questionnaire was not provided to NDDS. A blank copy of the questionnaire is included in Appendix E.',
                },
                {
                    label: 'Completed and provided',
                    text: 'A copy of the property questionnaire that was completed by ___ is included in Appendix E. Based on the questionnaire ___ list any important information.',
                },
                {
                    label: 'No major concerns noted',
                    text: 'No major concerns regarding the physical condition of the Subject Property and improvements were noted in the property questionnaire OR list concerns.',
                },
            ],
        },
    ]
}

//sec 4.2 - interviews

export const interviews = {
    dynamicInterviews: true,
    interviewTemplate: {
        fields: [
            {
                type: 'text',
                label: 'Interviewee',
                placeholder: 'Name/Title/Company',
            },
            {
                type: 'textarea',
                label: 'Pertinent Information',
                rows: 2,
                placeholder: 'XXX provided access and general property information.',
            },
            {
                type: 'textarea',
                label: 'Concerns',
                rows: 3,
                defaultValue: '',
                quickOptions: [
                    {
                        label: 'No major concerns',
                        text: 'No major concerns regarding the physical condition of the Subject Property and improvements were noted during the interviews conducted.',
                    },
                    {
                        label: 'Concerns noted',
                        text: 'Concerns regarding ___ were noted during the interviews. These issues are addressed in the applicable sections of this report.',
                    },
                ],
            },
        ],
    },
    interviewBlocks: [
        {
            id: 'interview-1',
            fields: [
                {
                    id: 'interviewee-1',
                    type: 'text',
                    label: 'Interviewee',
                    placeholder: 'Name/Title/Company',
                },
                {
                    id: 'pertinent-info-1',
                    type: 'textarea',
                    label: 'Pertinent Information',
                    rows: 2,
                    placeholder: 'XXX provided access and general property information.',
                },
                {
                    id: 'concerns-1',
                    type: 'textarea',
                    label: 'Concerns',
                    rows: 3,
                    defaultValue: '',
                    quickOptions: [
                        {
                            label: 'No major concerns',
                            text: 'No major concerns regarding the physical condition of the Subject Property and improvements were noted during the interviews conducted.',
                        },
                        {
                            label: 'Concerns noted',
                            text: 'Concerns regarding ___ were noted during the interviews. These issues are addressed in the applicable sections of this report.',
                        },
                    ],
                },
            ],
        },
    ]
}

//sec 4.3 - building and fire departments

export const buildingAndFireDepartments = {
    fields: [
        {
            id: 'building-dept-name',
            type: 'text',
            label: 'Building Department Contact',
            placeholder: 'City/County Building Department',
        },
        {
            id: 'building-dept-phone',
            type: 'text',
            label: 'Phone Number',
            placeholder: 'Phone number',
        },
        {
            id: 'building-dept-website',
            type: 'text',
            label: 'Website',
            placeholder: 'website',
        },
        {
            id: 'building-pertinent-info',
            type: 'textarea',
            label: 'Pertinent Information',
            rows: 2,
            placeholder: 'NDDS requested information pertaining, Building Permit Records, Certificates of Occupancy and any outstanding code violations for the Subject Property. According to ___',
        },
        {
            id: 'fire-dept-name',
            type: 'text',
            label: 'Fire Department Contact',
            placeholder: 'City/County Fire Department',
        },
        {
            id: 'fire-dept-phone',
            type: 'text',
            label: 'Phone Number',
            placeholder: 'Phone number',
        },
        {
            id: 'fire-dept-website',
            type: 'text',
            label: 'Website',
            placeholder: 'website',
        },
        {
            id: 'fire-pertinent-info',
            type: 'textarea',
            label: 'Pertinent Information',
            rows: 3,
            defaultValue: '',
            quickOptions: [
                {
                    label: 'Information requested',
                    text: 'NDDS requested information regarding any outstanding fire code violations and inspection records for the property. According to ___',
                },
                {
                    label: 'No response received',
                    text: 'NDDS has not received a response from the fire department as of the preparation of this report. It should be noted that municipal departments are often slow to respond to these type requests.',
                },
            ],
        },
        {
            id: 'building-fire-concerns',
            type: 'textarea',
            label: 'Concerns',
            rows: 2,
            defaultValue: '',
            quickOptions: [
                {
                    label: 'No concerns identified',
                    text: 'No concerns or significant code violations were identified during the check of building and fire department records.',
                },
                {
                    label: 'Describe concerns',
                    text: 'Or Describe site specific concerns...',
                },
            ],
        },
        {
            id: 'building-fire-recommendations',
            type: 'textarea',
            label: 'Recommendations',
            rows: 2,
            defaultValue: '',
            quickOptions: [
                {
                    label: 'No further study recommended',
                    text: 'No further study or action is recommended at this time.',
                },
                {
                    label: 'Site specific recommendations',
                    text: 'Or Make site specific recommendations...',
                },
            ],
        },
    ]
}

//sec 4.4 - zoning department

export const zoningDepartment = {
    fields: [
        {
            id: 'zoning-dept-contact',
            type: 'text',
            label: 'Zoning Department Contact',
            placeholder: 'Give name and title',
        },
        {
            id: 'zone',
            type: 'text',
            label: 'Zone',
            placeholder: '(Insert zone)',
        },
        {
            id: 'zoning-compliance',
            type: 'textarea',
            label: 'Zoning Compliance',
            rows: 4,
            defaultValue: '',
            placeholder: 'Recommended response...',
            quickOptions: [
                {
                    label: 'Information requested',
                    text: 'NDDS requested information regarding the current zoning of the property and whether the property is a legal conforming use or a legal non-conforming use according to density, parking, use and current codes. According to ___.',
                },
                {
                    label: 'Appears consistent with zoning',
                    text: 'While the property usage appears consistent with the zoning, a formal zoning determination is outside the scope of work for this project.',
                },
            ],
        },
        {
            id: 'zoning-concerns',
            type: 'textarea',
            label: 'Concerns',
            rows: 2,
            defaultValue: '',
            quickOptions: [
                {
                    label: 'No concerns identified',
                    text: 'No concerns regarding zoning were identified.',
                },
                {
                    label: 'Describe concerns',
                    text: 'Or Describe site specific concerns...',
                },
            ],
        },
        {
            id: 'zoning-recommendations',
            type: 'textarea',
            label: 'Recommendations',
            rows: 2,
            defaultValue: '',
            quickOptions: [
                {
                    label: 'No further study recommended',
                    text: 'No further study or action is recommended at this time.',
                },
                {
                    label: 'Site specific recommendations',
                    text: 'Or Make site specific recommendations...',
                },
            ],
        },
    ]
}

//sec 4.5 - previous reports

export const previousReports = {
    introText: 'NDDS was not provided any previous reports for the Subject Property.',
    fields: [
        {
            id: 'report-title',
            type: 'text',
            label: 'Report Title',
            placeholder: 'XX',
        },
        {
            id: 'prepared-by',
            type: 'text',
            label: 'Prepared By',
            placeholder: 'XX',
        },
        {
            id: 'date-of-report',
            type: 'text',
            label: 'Date of Report',
            placeholder: 'XX',
        },
        {
            id: 'report-pertinent-info',
            type: 'textarea',
            label: 'Pertinent Information',
            rows: 2,
            placeholder: 'XX',
        },
    ]
}
