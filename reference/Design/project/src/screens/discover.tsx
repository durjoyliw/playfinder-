import { useState } from 'react';
import { Plus, Minus, Crosshair, Layers } from 'lucide-react';
import { VENUES, SPORTS_LIST, SPORT_EMOJI, SPORT_COLOURS, type Venue } from '@/data';
import { SportPills } from '@/components/shared';

export function DiscoverScreen() {
  const [selectedSport, setSelectedSport] = useState('All');
  const [sheetTab, setSheetTab] = useState<'venues' | 'clubs'>('venues');
  const [expanded, setExpanded] = useState(false);

  const filteredVenues = selectedSport === 'All'
    ? VENUES
    : VENUES.filter(v => v.sport === selectedSport);

  return (
    <div className="discover-screen fade-in">
      <div className="discover-map">
        <div className="map-canvas">
          <div className="map-grid" />
          <div className="river" />
          <div className="road r1" />
          <div className="road r2" />
          <div className="road r3" />
          <span className="place-label" style={{ left: '15%', top: '25%' }}>WEST END</span>
          <span className="place-label" style={{ left: '45%', top: '48%' }}>CITY CENTRE</span>
          <span className="place-label" style={{ left: '65%', top: '68%' }}>PARKHEAD</span>
        </div>

        <div className="map-overlay-top">
          <div className="map-badge"><span className="dot" /> GLASGOW LIVE</div>
          <SportPills selected={selectedSport} onSelect={setSelectedSport} sports={SPORTS_LIST} />
        </div>

        {filteredVenues.map(venue => {
          const colour = SPORT_COLOURS[venue.sport];
          return (
            <div
              key={venue.id}
              className="map-marker"
              style={{ left: `${venue.mapPos.x}%`, top: `${venue.mapPos.y}%`, ['--sport-colour' as string]: colour }}
            >
              <div className="pin"><span className="emoji">{SPORT_EMOJI[venue.sport]}</span></div>
              <div className="pulse-ring" />
            </div>
          );
        })}

        <div className="map-controls">
          <button className="map-ctrl"><Plus size={20} /></button>
          <button className="map-ctrl"><Minus size={20} /></button>
          <button className="map-ctrl"><Crosshair size={20} /></button>
          <button className="map-ctrl"><Layers size={20} /></button>
        </div>
      </div>

      <div className={`bottom-sheet ${expanded ? 'expanded' : ''}`}>
        <div className="grip" onClick={() => setExpanded(!expanded)} />
        <div className="sheet-head">
          <div className="sheet-tabs">
            <button className={`sheet-tab ${sheetTab === 'venues' ? 'active' : ''}`} onClick={() => setSheetTab('venues')}>
              Venues
            </button>
            <button className={`sheet-tab ${sheetTab === 'clubs' ? 'active' : ''}`} onClick={() => setSheetTab('clubs')}>
              Clubs
            </button>
          </div>
          <span className="sheet-count">{filteredVenues.length} nearby</span>
        </div>
        <div className="sheet-body">
          {sheetTab === 'venues' ? (
            <div className="venue-list">
              <div style={{ marginBottom: '14px' }}>
                <div className="eyebrow">GLASGOW · WITHIN 5 MI</div>
                <div className="h2" style={{ marginTop: '4px' }}>Play near you</div>
              </div>
              {filteredVenues.map(venue => (
                <VenueCard key={venue.id} venue={venue} />
              ))}
            </div>
          ) : (
            <div className="venue-list">
              <div style={{ marginBottom: '14px' }}>
                <div className="eyebrow">GLASGOW · 12 ACTIVE CLUBS</div>
                <div className="h2" style={{ marginTop: '4px' }}>Local clubs</div>
              </div>
              <p style={{ color: 'var(--text-3)', fontSize: 14, padding: '20px', textAlign: 'center' }}>
                Club listings coming soon.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VenueCard({ venue }: { venue: Venue }) {
  return (
    <div className="venue-card">
      <div className="thumb">
        <img src={venue.image} alt={venue.name} loading="lazy" />
        <span className="sport-badge">{SPORT_EMOJI[venue.sport]}</span>
      </div>
      <div className="info">
        <div className="name">{venue.name}</div>
        <div className="addr">{venue.address}</div>
        <div className="bottom-row">
          <span className="dist">{venue.distance}</span>
          <span className="rating">{'★'.repeat(venue.rating)}</span>
          {venue.bookable && <span className="bookable">BOOKABLE</span>}
        </div>
      </div>
    </div>
  );
}
