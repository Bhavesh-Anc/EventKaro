'use client';

import { useRouter } from 'next/navigation';
import { TeamCollaborators, TeamMember } from '@/components/features/team-collaborators';
import {
  inviteTeamMember,
  removeTeamMember,
  updateTeamMemberRole,
  resendTeamInvite,
} from '@/actions/team';

interface Props {
  eventId: string;
  eventName: string;
  currentUserId: string;
  initialMembers: TeamMember[];
}

export function TeamClient({
  eventId,
  eventName,
  currentUserId,
  initialMembers,
}: Props) {
  const router = useRouter();

  const handleInvite = async (email: string, role: 'admin' | 'editor' | 'viewer') => {
    const result = await inviteTeamMember(eventId, email, role);
    if (result.success) {
      router.refresh();
    }
    return result;
  };

  const handleRemove = async (memberId: string) => {
    const result = await removeTeamMember(memberId, eventId);
    if (result.success) {
      router.refresh();
    }
    return result;
  };

  const handleUpdateRole = async (memberId: string, role: 'admin' | 'editor' | 'viewer') => {
    const result = await updateTeamMemberRole(memberId, eventId, role);
    if (result.success) {
      router.refresh();
    }
    return result;
  };

  const handleResendInvite = async (memberId: string) => {
    const result = await resendTeamInvite(memberId, eventId);
    if (result.success) {
      router.refresh();
    }
    return result;
  };

  return (
    <TeamCollaborators
      members={initialMembers}
      currentUserId={currentUserId}
      eventName={eventName}
      onInvite={handleInvite}
      onRemove={handleRemove}
      onUpdateRole={handleUpdateRole}
      onResendInvite={handleResendInvite}
    />
  );
}
