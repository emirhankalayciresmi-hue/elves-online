// src/context/PlayerProfileContext.jsx
// Evrensel Oyuncu Profil Yönetim Bağlamı (Context & Provider)

import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { getPlayerProfile } from '../services/playerProfileService';
import PlayerHoverCard from '../components/PlayerHoverCard';
import PlayerInspectorModal from '../components/PlayerInspectorModal';

const PlayerProfileContext = createContext(null);

export function PlayerProfileProvider({
  children,
  activePlayer,
  onWhisper,
  onInviteParty,
  onInviteGuild,
  onChallengeDuel,
}) {
  const [inspectedProfile, setInspectedProfile] = useState(null);
  const [hoverState, setHoverState] = useState(null); // { profile, pos, isMobile }
  const hoverTimeoutRef = useRef(null);

  // Hover kartını göster
  const openHoverCard = useCallback((playerInfo, pos, isMobile = false) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    const profile = getPlayerProfile(playerInfo, activePlayer);
    setHoverState({ profile, pos, isMobile });
  }, [activePlayer]);

  // Hover kartını gecikmeli veya anında gizle
  const closeHoverCard = useCallback((immediate = false) => {
    if (immediate) {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      setHoverState(null);
      return;
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setHoverState(null);
    }, 250);
  }, []);

  // Hover kartını açık tut (kartın üzerine mouse geldiğinde kapanmasın)
  const retainHoverCard = useCallback(() => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
  }, []);

  // Tam detaylı inceleme modalını aç
  const openInspector = useCallback((playerInfo) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHoverState(null);
    const profile = getPlayerProfile(playerInfo, activePlayer);
    setInspectedProfile(profile);
  }, [activePlayer]);

  const closeInspector = useCallback(() => {
    setInspectedProfile(null);
  }, []);

  return (
    <PlayerProfileContext.Provider
      value={{
        openHoverCard,
        closeHoverCard,
        retainHoverCard,
        openInspector,
        closeInspector,
      }}
    >
      {children}

      {/* Süzülen Mini Profil Kartı */}
      {hoverState && !inspectedProfile && (
        <div
          onMouseEnter={retainHoverCard}
          onMouseLeave={() => closeHoverCard(false)}
        >
          {hoverState.isMobile ? (
            <div
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
              onClick={() => closeHoverCard(true)}
            >
              <div onClick={(e) => e.stopPropagation()}>
                <PlayerHoverCard
                  profile={hoverState.profile}
                  position={hoverState.pos}
                  isMobile={true}
                  onClose={() => closeHoverCard(true)}
                  onInspect={(prof) => {
                    closeHoverCard(true);
                    setInspectedProfile(prof);
                  }}
                />
              </div>
            </div>
          ) : (
            <PlayerHoverCard
              profile={hoverState.profile}
              position={hoverState.pos}
              isMobile={false}
              onClose={() => closeHoverCard(true)}
              onInspect={(prof) => {
                closeHoverCard(true);
                setInspectedProfile(prof);
              }}
            />
          )}
        </div>
      )}

      {/* Tam Ekran Detaylı Karakter Analiz Modalı */}
      {inspectedProfile && (
        <PlayerInspectorModal
          profile={inspectedProfile}
          onClose={closeInspector}
          onWhisper={onWhisper}
          onInviteParty={onInviteParty}
          onInviteGuild={onInviteGuild}
          onChallengeDuel={onChallengeDuel}
        />
      )}
    </PlayerProfileContext.Provider>
  );
}

export function usePlayerProfile() {
  const context = useContext(PlayerProfileContext);
  if (!context) {
    throw new Error('usePlayerProfile must be used within a PlayerProfileProvider');
  }
  return context;
}
