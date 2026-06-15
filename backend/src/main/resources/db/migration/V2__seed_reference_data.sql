-- ══════════════════════════════════════════════════════════════
-- V2__seed_reference_data.sql
-- Pre-populate locomotive types, train categories, sheds, stations
-- ══════════════════════════════════════════════════════════════

-- ── Train Categories ──────────────────────────────────────────
INSERT INTO train_categories (name, description) VALUES
('Rajdhani Express',     'Premium AC express trains connecting state capitals to New Delhi'),
('Duronto Express',      'Non-stop express trains between major cities, limited halts'),
('Vande Bharat Express', 'Semi-high speed electric multiple units, modern coaches'),
('Shatabdi Express',     'Day intercity express trains, chair car and executive class'),
('Tejas Express',        'Modern private-operated express trains'),
('Gatimaan Express',     'Indias first semi-high speed train'),
('Superfast Express',    'Trains running at average speed above 55 kmph'),
('Express',              'Regular express passenger trains'),
('Mail Express',         'Mail and express combined trains'),
('Passenger',            'Slow local passenger trains stopping at all stations'),
('EMU / MEMU',           'Electric / Mainline Electric Multiple Units'),
('DEMU',                 'Diesel Electric Multiple Unit'),
('Freight',              'Goods carrying trains'),
('Special',              'Special purpose, festive, or seasonal trains'),
('Humsafar Express',     'Fully AC 3-tier superfast express trains'),
('Antyodaya Express',    'Fully unreserved superfast trains'),
('Jan Shatabdi',         'Budget version of Shatabdi, partially unreserved');

-- ── Locomotive Types ──────────────────────────────────────────
INSERT INTO loco_types (name, traction, description) VALUES
('WAP-7',   'ELECTRIC', '25kV AC passenger locomotive, 6120 HP, max 140 kmph'),
('WAP-5',   'ELECTRIC', '25kV AC high-speed passenger locomotive, 5340 HP, max 160 kmph'),
('WAP-4',   'ELECTRIC', '25kV AC passenger locomotive, 5000 HP, workhorse of Indian Railways'),
('WAG-9',   'ELECTRIC', '25kV AC freight locomotive, 6120 HP, widely used'),
('WAG-9H',  'ELECTRIC', '25kV AC freight locomotive, 6120 HP, high adhesion variant'),
('WAG-12B', 'ELECTRIC', 'Newest AC freight locomotive, 12000 HP, imported from France'),
('WAM-4',   'ELECTRIC', 'Older 25kV AC mixed traffic locomotive'),
('WCAM-3',  'DUAL',     '1500V DC / 25kV AC dual-system locomotive for Mumbai suburban'),
('WDM-3A',  'DIESEL',   '3100 HP general purpose diesel locomotive'),
('WDM-3D',  'DIESEL',   '3300 HP diesel locomotive'),
('WDP-4',   'DIESEL',   '4000 HP high-speed diesel passenger locomotive'),
('WDP-4B',  'DIESEL',   '4500 HP high-speed diesel passenger locomotive'),
('WDP-4D',  'DIESEL',   '4500 HP diesel locomotive with microprocessor controls'),
('WDG-4',   'DIESEL',   '4000 HP diesel freight locomotive'),
('WDG-4D',  'DIESEL',   '4500 HP diesel freight locomotive with microprocessor controls'),
('WDG-6G',  'DIESEL',   '6000 HP diesel freight locomotive'),
('ALCo',    'DIESEL',   'Generic ALCo family diesel locomotives');

-- ── Locomotive Sheds ──────────────────────────────────────────
INSERT INTO loco_sheds (name, zone, location) VALUES
('Itarsi Electric Loco Shed',      'WCR',  'Itarsi, MP'),
('Bhusawal Electric Loco Shed',    'CR',   'Bhusawal, Maharashtra'),
('Kalyan Electric Loco Shed',      'CR',   'Kalyan, Maharashtra'),
('Pune Electric Loco Shed',        'CR',   'Pune, Maharashtra'),
('Ajni Electric Loco Shed',        'CR',   'Nagpur, Maharashtra'),
('Erode Electric Loco Shed',       'SR',   'Erode, Tamil Nadu'),
('Royapuram Electric Loco Shed',   'SR',   'Chennai, Tamil Nadu'),
('Ghaziabad Electric Loco Shed',   'NCR',  'Ghaziabad, UP'),
('Tughlakabad Electric Loco Shed', 'NR',   'Delhi'),
('Ludhiana Electric Loco Shed',    'NR',   'Ludhiana, Punjab'),
('Lallaguda Electric Loco Shed',   'SCR',  'Hyderabad, Telangana'),
('Krishnarajapuram Loco Shed',     'SWR',  'Bengaluru, Karnataka'),
('Gomoh Electric Loco Shed',       'ECR',  'Gomoh, Jharkhand'),
('Santragachi Electric Loco Shed', 'SER',  'Santragachi, West Bengal'),
('Hubli Diesel Loco Shed',         'SWR',  'Hubli, Karnataka'),
('Ratlam Diesel Loco Shed',        'WR',   'Ratlam, MP'),
('Sabarmati Diesel Loco Shed',     'WR',   'Ahmedabad, Gujarat'),
('Vatva Diesel Loco Shed',         'WR',   'Ahmedabad, Gujarat'),
('Valsad Diesel Loco Shed',        'WR',   'Valsad, Gujarat'),
('Kazipet Diesel Loco Shed',       'SCR',  'Warangal, Telangana');

-- ── Common Stations (Mumbai Division focus) ───────────────────
INSERT INTO stations (name, station_code, state, railway_zone) VALUES
('Chhatrapati Shivaji Maharaj Terminus', 'CSMT', 'Maharashtra', 'CR'),
('Dadar',                                'DR',   'Maharashtra', 'CR'),
('Kalyan Junction',                      'KYN',  'Maharashtra', 'CR'),
('Thane',                                'TNA',  'Maharashtra', 'CR'),
('Shahad',                               'SHAD', 'Maharashtra', 'CR'),
('Ambivli',                              'AMBV', 'Maharashtra', 'CR'),
('Titwala',                              'TILE', 'Maharashtra', 'CR'),
('Khardi',                               'KHRD', 'Maharashtra', 'CR'),
('Kasara',                               'KSRA', 'Maharashtra', 'CR'),
('Igatpuri',                             'IGP',  'Maharashtra', 'CR'),
('Nashik Road',                          'NK',   'Maharashtra', 'CR'),
('Bhusawal Junction',                    'BSL',  'Maharashtra', 'CR'),
('Manmad Junction',                      'MMR',  'Maharashtra', 'CR'),
('Pune Junction',                        'PUNE', 'Maharashtra', 'CR'),
('Lonavala',                             'LNL',  'Maharashtra', 'CR'),
('Karjat',                               'KJT',  'Maharashtra', 'CR'),
('Panvel',                               'PNVL', 'Maharashtra', 'CR'),
('Mumbra',                               'MBRE', 'Maharashtra', 'CR'),
('Diva Junction',                        'DIVA', 'Maharashtra', 'CR'),
('Turbhe',                               'TBE',  'Maharashtra', 'CR'),
('Vasai Road',                           'BSR',  'Maharashtra', 'WR'),
('Virar',                                'VR',   'Maharashtra', 'WR'),
('Surat',                                'ST',   'Gujarat',     'WR'),
('Ahmedabad Junction',                   'ADI',  'Gujarat',     'WR'),
('Hazrat Nizamuddin',                    'NZM',  'Delhi',       'NR'),
('New Delhi',                            'NDLS', 'Delhi',       'NR'),
('Mumbai Central',                       'MMCT', 'Maharashtra', 'WR'),
('Bandra Terminus',                      'BDTS', 'Maharashtra', 'WR'),
('Nagpur Junction',                      'NGP',  'Maharashtra', 'CR'),
('Itarsi Junction',                      'ET',   'MP',          'WCR');

-- ── Default Collections ───────────────────────────────────────
INSERT INTO collections (name, description) VALUES
('Rajdhani Collection',        'All Rajdhani Express videos'),
('Duronto Collection',         'All Duronto Express videos'),
('Vande Bharat Collection',    'Vande Bharat Express videos'),
('Freight Collection',         'Freight and goods train videos'),
('KAVACH Collection',          'Videos featuring KAVACH-equipped trains and locos'),
('Rare Locomotives Collection','Videos of rare and uncommon locomotive sightings'),
('Mumbai Division',            'Videos recorded in the Mumbai CR division'),
('High Speed Runs',            'High speed and MPS run videos'),
('Night Photography',          'Night railfanning sessions'),
('Curve and Gradient Shots',   'Videos from scenic curves and gradients');
