import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppShell } from './AppShell'
import {
  BrandContent, BrandDashboard, BrandNewOpportunity, BrandOpportunities,
  BrandOpportunityWorkspace, BrandProducts, BrandProfilePage, BrandReports,
} from './pages/BrandPages'
import {
  LeaderBudget, LeaderCampaigns, LeaderCampaignWorkspace, LeaderCommunityProfile, LeaderContent,
  LeaderDashboard, LeaderMembers, LeaderOpportunities, LeaderOpportunityDetail,
} from './pages/LeaderPages'
import {
  MemberCampaignDetail, MemberCampaigns, MemberContent, MemberDashboard, MemberProfile, MemberRewards,
} from './pages/MemberPages'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, left: 0 }) }, [pathname])
  return null
}

export function App() {
  return <><ScrollToTop /><Routes>
    <Route element={<AppShell />}>
      <Route path="/brand" element={<BrandDashboard />} />
      <Route path="/brand/products" element={<BrandProducts />} />
      <Route path="/brand/opportunities" element={<BrandOpportunities />} />
      <Route path="/brand/opportunities/new" element={<BrandNewOpportunity />} />
      <Route path="/brand/opportunities/:opportunityId" element={<BrandOpportunityWorkspace />} />
      <Route path="/brand/communities" element={<Navigate to="/brand/opportunities/opportunity-real-skin?tab=communities" replace />} />
      <Route path="/brand/content" element={<BrandContent />} />
      <Route path="/brand/reports" element={<BrandReports />} />
      <Route path="/brand/profile" element={<BrandProfilePage />} />

      <Route path="/leader" element={<LeaderDashboard />} />
      <Route path="/leader/opportunities" element={<LeaderOpportunities />} />
      <Route path="/leader/opportunities/:opportunityId" element={<LeaderOpportunityDetail />} />
      <Route path="/leader/campaigns" element={<LeaderCampaigns />} />
      <Route path="/leader/campaigns/:communityCampaignId" element={<LeaderCampaignWorkspace />} />
      <Route path="/leader/members" element={<LeaderMembers />} />
      <Route path="/leader/content" element={<LeaderContent />} />
      <Route path="/leader/budget" element={<LeaderBudget />} />
      <Route path="/leader/community" element={<LeaderCommunityProfile />} />

      <Route path="/member" element={<MemberDashboard />} />
      <Route path="/member/campaigns" element={<MemberCampaigns />} />
      <Route path="/member/campaigns/:communityCampaignId" element={<MemberCampaignDetail />} />
      <Route path="/member/content" element={<MemberContent />} />
      <Route path="/member/rewards" element={<MemberRewards />} />
      <Route path="/member/profile" element={<MemberProfile />} />
    </Route>
    <Route path="/business/*" element={<Navigate to="/brand" replace />} />
    <Route path="*" element={<Navigate to="/brand" replace />} />
  </Routes></>
}
