import { useState } from 'react';
import { ShipInsignia } from '../common/ShipInsignia';
import { useGameSession } from '../../context/GameSessionContext';
import type { CommandProfile } from '../../types/commandProfile';
import {
	formatProfileCaptainLabel,
	formatProfileDateShort,
	formatProfileShipLabel,
	formatProfileTime,
} from '../../utils/profileDisplay';

function ProfileCard({
	profile,
	selected,
	onSelect,
	onDeleteRequest,
}: {
	profile: CommandProfile;
	selected: boolean;
	onSelect: () => void;
	onDeleteRequest: () => void;
}) {
	return (
		<button
			type="button"
			className={`profile-card terminal-bevel-sm ${selected ? 'profile-card--selected' : ''}`}
			onClick={onSelect}
		>
			<div className="profile-card-insignia">
				<ShipInsignia size={28} className="text-[var(--accent-gold)]" />
			</div>
			<div className="profile-card-body">
				<div className="profile-card-captain">{formatProfileCaptainLabel(profile.captain.name)}</div>
				<div className="profile-card-ship">{formatProfileShipLabel(profile.vessel.name)}</div>
				<div className="profile-card-registry">{profile.vessel.registry}</div>
				<div className="profile-card-chrono">
					<span>{formatProfileDateShort(profile)}</span>
					<span className="profile-card-chrono-sep">·</span>
					<span>{formatProfileTime(profile)}</span>
				</div>
			</div>
			<button
				type="button"
				className="profile-card-delete"
				onClick={(event) => {
					event.stopPropagation();
					onDeleteRequest();
				}}
				aria-label={`Delete command profile for ${profile.captain.name}`}
			>
				×
			</button>
		</button>
	);
}

export function CommandProfileScreen() {
	const { profiles, openCreateProfile, selectProfile, deleteProfile } = useGameSession();
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<CommandProfile | null>(null);

	const handleSelect = (profile: CommandProfile) => {
		setSelectedId(profile.id);
		selectProfile(profile.id);
	};

	const confirmDelete = () => {
		if (!deleteTarget) return;
		deleteProfile(deleteTarget.id);
		if (selectedId === deleteTarget.id) {
			setSelectedId(null);
		}
		setDeleteTarget(null);
	};

	return (
		<div className="game-screen profile-screen">
			<div className="profile-screen-header terminal-chrome terminal-bevel-sm">
				<div className="profile-screen-brand">
					<ShipInsignia size={32} className="text-[var(--accent-gold-bright)]" />
					<div>
						<h1 className="profile-screen-title">COMMAND PROFILE ACCESS</h1>
						<p className="profile-screen-subtitle">Union Terminal · Authorised commanding officers</p>
					</div>
				</div>
			</div>

			<div className="profile-screen-body">
				<p className="profile-screen-prompt">SELECT COMMAND PROFILE TO AUTHENTICATE</p>

				<div className="profile-grid">
					{profiles.map((profile) => (
						<ProfileCard
							key={profile.id}
							profile={profile}
							selected={selectedId === profile.id}
							onSelect={() => handleSelect(profile)}
							onDeleteRequest={() => setDeleteTarget(profile)}
						/>
					))}

					<button
						type="button"
						className="profile-card profile-card--create terminal-bevel-sm"
						onClick={openCreateProfile}
					>
						<span className="profile-create-icon">+</span>
						<span className="profile-create-label">CREATE COMMAND PROFILE</span>
					</button>
				</div>
			</div>

			{deleteTarget ? (
				<div className="profile-modal-backdrop">
					<div className="profile-modal terminal-bevel-sm" role="dialog" aria-modal="true">
						<h2 className="profile-modal-title">CONFIRM PROFILE DELETION</h2>
						<p className="profile-modal-copy">
							Permanently remove command profile for{' '}
							<strong>{formatProfileCaptainLabel(deleteTarget.captain.name)}</strong> aboard{' '}
							<strong>{formatProfileShipLabel(deleteTarget.vessel.name)}</strong>? This action cannot
							be undone.
						</p>
						<div className="profile-modal-actions">
							<button
								type="button"
								className="game-btn game-btn--ghost"
								onClick={() => setDeleteTarget(null)}
							>
								CANCEL
							</button>
							<button type="button" className="game-btn game-btn--danger" onClick={confirmDelete}>
								DELETE PROFILE
							</button>
						</div>
					</div>
				</div>
			) : null}
		</div>
	);
}
