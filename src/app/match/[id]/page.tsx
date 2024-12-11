"use client";

import MatchPage from "@/components/MatchPage";
import { useParams } from "next/navigation";

export default function EditMatch() {
	const { id } = useParams();
	const matchId = Array.isArray(id) ? id.join() : id || undefined;
	return <MatchPage id={matchId} />;
}
